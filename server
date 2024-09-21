import { Firestore } from '@google-cloud/firestore';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response, Router } from 'express';
import useragent from 'express-useragent';
import helmet from 'helmet';
import { IncomingHttpHeaders } from 'http';
import createError, { HttpError } from 'http-errors';
import jwt from 'jsonwebtoken';

// 환경 변수 로드
dotenv.config();

// Custom type definition for Request with user property and extended headers
interface CustomRequest extends Request {
  user?: jwt.JwtPayload | string;
  headers: IncomingHttpHeaders & {
    authorization?: string;
  };
}

// 카카오 API 응답 타입 정의
interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token: string;
  expires_in: number;
  scope: string;
  refresh_token_expires_in: number;
}

interface KakaoUserInfo {
  id: number;
  kakao_account: {
    email: string;
    profile: {
      nickname: string;
      profile_image_url: string;
    };
  };
}

// Initialize Firestore
const firestore = new Firestore();

export const healthzPath = '/healthz';
export const healthzRouter = Router();

// Health check endpoints
healthzRouter.get('/readiness', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'OK' });
  } catch (err) {
    return next(err);
  }
});

healthzRouter.get('/liveness', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    res.json({ message: 'OK' });
  } catch (err) {
    return next(err);
  }
});

const app = express();

app.use(cors());
app.use(helmet());
app.use(useragent.express());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test user list (Mock data)
const users = [
  {
    id: 1,
    username: 'testuser',
    password: '$2b$10$WnqZwVJeK.YzhB.CnDqF/OZw68r9.f9k1J4PZbQURHqwaYbbBlG.m', // 'password' hashed with bcrypt
  },
];

// 로그인 처리
app.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    next(err);
  }
});

// 인증 미들웨어
function authenticateToken(req: CustomRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: 'Authorization header is missing' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Token is missing' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Token is not valid' });
    }

    req.user = user;
    next();
  });
}

// 보호된 라우트 예시
app.get('/protected', authenticateToken, (req: CustomRequest, res: Response) => {
  res.json({ message: 'This is protected content', user: req.user });
});

// Health check 라우터 사용
app.use(healthzPath, healthzRouter);

// 카카오 로그인 엔드포인트
app.post('/auth/kakao', async (req: Request, res: Response, next: NextFunction) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Authorization code is missing' });
  }

  try {
    // 카카오 토큰 요청
    const tokenResponse = await axios.post<KakaoTokenResponse>(
      'https://kauth.kakao.com/oauth/token',
      null,
      {
        params: {
          grant_type: 'authorization_code',
          client_id: process.env.KAKAO_CLIENT_ID,
          redirect_uri: process.env.KAKAO_REDIRECT_URI,
          code: code,
          client_secret: process.env.KAKAO_CLIENT_SECRET,
        },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    );

    const accessToken = tokenResponse.data.access_token;

    // 카카오 사용자 정보 요청
    const userInfoResponse = await axios.get<KakaoUserInfo>(
      'https://kapi.kakao.com/v2/user/me',
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    const { id, kakao_account } = userInfoResponse.data;
    const { email, profile } = kakao_account;

    const token = jwt.sign(
      {
        id: id,
        email: email,
        profile: profile,
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ token, user: { id, email, profile } });
  } catch (err) {
    next(err);
  }
});

// Firestore를 이용해 약 복용 스케줄 추가
app.post('/medication', async (req: Request, res: Response, next: NextFunction) => {
  const { userId, medication, time } = req.body;

  if (!userId || !medication || !time) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await firestore.collection('medications').add({
      userId,
      medication,
      time,
      taken: false,
    });

    res.json({ message: 'Medication scheduled' });
  } catch (err) {
    next(err);
  }
});

// 약 복용 완료 처리
app.post('/medication/complete', async (req: Request, res: Response, next: NextFunction) => {
  const { medicationId } = req.body;

  if (!medicationId) {
    return res.status(400).json({ error: 'Medication ID is missing' });
  }

  try {
    const doc = firestore.collection('medications').doc(medicationId);
    await doc.update({ taken: true });

    res.json({ message: 'Medication marked as taken' });
  } catch (err) {
    next(err);
  }
});

// 약 복용 시간 변경
app.put('/medication/:id', async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const { time } = req.body;

  if (!time) {
    return res.status(400).json({ error: 'Time is missing' });
  }

  try {
    const doc = firestore.collection('medications').doc(id);
    await doc.update({ time });

    res.json({ message: 'Medication time updated' });
  } catch (err) {
    next(err);
  }
});

// 404 처리
app.use((_req, _res, next) => {
  next(createError(404));
});

// 에러 핸들링
app.use((err: HttpError, _req: Request, res: Response, _next: NextFunction) => {
  res.status(err.status || 500);
  res.json({ error: err.message });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
