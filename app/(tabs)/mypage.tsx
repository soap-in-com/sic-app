import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const MenuButton = ({ children }: { children: string }) => {
  const onPress = () => {
    Alert.alert(`${children} 버튼 눌림!!`)
  }

  return (
    <TouchableOpacity style={styles.sectionTitle} onPress={onPress}>
      <Text style={styles.sectionText}>{children}</Text>
    </TouchableOpacity>
  )
}

export default function MyPage() {
  return (
    <ScrollView>
      <SafeAreaView>
        <View
          style={{
            flex: 1,
            backgroundColor: '#fff',
            padding: 20,
            gap: 10,
          }}
        >
          <View style={styles.myProfile}>
            <MaterialCommunityIcons
              name='face-man-profile'
              size={84}
              color='black'
            />
            <Text style={{ fontSize: 24, fontWeight: '600', color: '#ccc' }}>
              이성현
            </Text>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>계정</Text>

            <MenuButton>my_id_here</MenuButton>
            <MenuButton>비밀번호 변경</MenuButton>
            <MenuButton>로그아웃</MenuButton>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>알림설정 영역</Text>
            <MenuButton>푸시 알림 설정</MenuButton>
            <MenuButton>이메일 알림 설정</MenuButton>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱테마 및 글꼴 설정</Text>
            <MenuButton>다크모드</MenuButton>
            <MenuButton>글꼴 크기 조정</MenuButton>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>개인정보 보호 설정</Text>
            <MenuButton>위치서비스 데이터 수짐 동의</MenuButton>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>앱 정보 및 도움말</Text>
            <MenuButton>앱 버전</MenuButton>
            <MenuButton>문의하기</MenuButton>
            <MenuButton>공지사항</MenuButton>
            <MenuButton>서비스 이용 약관</MenuButton>
            <MenuButton>개인정보 처리방침</MenuButton>
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>기타</Text>
            <MenuButton>앱 공유하기</MenuButton>
            <MenuButton>계정 탈퇴</MenuButton>
          </View>
        </View>
      </SafeAreaView>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  myProfile: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderWidth: 2,
    borderRadius: 14,
    marginBottom: 10,
  },
  section: {
    gap: 4,
    borderBottomWidth: 0.5,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
  },
  sectionText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ccc',
  },
})
