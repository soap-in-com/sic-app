import React from 'react';
import { Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// LocaleConfig 설정 추가
LocaleConfig.locales['ko'] = {
  monthNames: [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ],
  monthNamesShort: [
    '1.', '2.', '3.', '4.', '5.', '6.',
    '7.', '8.', '9.', '10.', '11.', '12.'
  ],
  dayNames: [
    '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'
  ],
  dayNamesShort: ['일', '월', '화', '수', '목', '금', '토'],
  today: '오늘'
};

// Locale 설정을 'ko'로 변경
LocaleConfig.defaultLocale = 'ko';

const CalendarScreen = () => {
  return (
    <View>
      <Calendar
        // 초기에 보이는 달. 기본값 = Date()
        current={'2024-07-01'}
        // 날짜를 눌렀을 때 처리하는 콜백 함수
        onDayPress={(day) => {
          console.log('선택된 날', day);
        }}
        // 월 형식을 표시할지 여부
        monthFormat={'yyyy.MM'}
        // 월 페이지에 다른 달의 날짜를 보여주지 않음
        hideExtraDays={true}
        // firstDay=1이면 주는 월요일부터 시작.
        firstDay={0}
      />
    </View>
  );
}

export default CalendarScreen;