import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native'; // useNavigation 훅 임포트
import React from 'react';
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TermsOfService = () => {
  const navigation = useNavigation(); // useNavigation 훅 사용

  // 뒤로 가기 버튼을 눌렀을 때 실행될 함수
  const handleBackPress = () => {
    navigation.goBack(); // 이전 화면으로 이동
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      {/* 상단 바: 뒤로 가기 버튼과 제목 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>이용약관</Text>
        {/* 여백을 위한 빈 공간을 Text로 교체 */}
        <Text style={{ width: 24 }}> </Text>
      </View>

      {/* 이용 약관 내용 */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 약관 내용 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            제 1조 (위치 기반 서비스 동의)
          </Text>
          <Text style={styles.contentText}>
            본 서비스는 사용자의 위치 정보를 기반으로 서비스를 제공하고 향상된
            사용자 경험을 위해 활용될 수 있습니다. 사용자는 본 서비스 이용 시
            위치 정보 제공에 동의한 것으로 간주합니다. 위치 정보는 사용자의
            기기에서 실시간으로 수집되며, 서비스 제공 외 다른 목적으로는
            사용되지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제 2조 (마이크 허용)</Text>
          <Text style={styles.contentText}>
            본 서비스는 음성 명령 및 검색 기능을 제공하기 위해 마이크 접근을
            요구할 수 있습니다. 사용자는 마이크 접근을 허용함으로써 서비스 내
            음성 기능을 활용할 수 있습니다. 마이크를 통한 데이터는 음성 인식 및
            서비스 개선 목적 외에 다른 용도로 저장되지 않으며, 사용자의 명시적인
            동의 없이는 제3자와 공유되지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제 3조 (녹음 허용)</Text>
          <Text style={styles.contentText}>
            본 서비스는 사용자가 음성 메시지를 전송하거나 녹음할 수 있는 기능을
            제공합니다. 사용자는 녹음 기능을 허용함으로써 음성 관련 기능을
            사용할 수 있으며, 녹음된 데이터는 서비스 제공 및 품질 향상을 위해
            사용될 수 있습니다. 녹음된 데이터는 보안이 보장된 서버에 저장되며,
            서비스 제공 목적 외 다른 용도로 사용되지 않습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제 4조 (개인정보 처리 방침)</Text>
          <Text style={styles.contentText}>
            본 서비스는 사용자의 개인정보를 안전하게 보호하며, 관련 법령에 따라
            적법하고 정당하게 처리합니다. 회사는 사용자의 동의 없이 개인정보를
            제3자에게 제공하지 않으며, 개인정보의 수집 목적과 범위는 회원가입,
            서비스 이용, 고객 지원 등을 위해 제한됩니다. 개인정보 처리에 대한
            자세한 사항은 개인정보 처리방침을 참조하시기 바랍니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제 5조 (카카오톡 로그인 관련)</Text>
          <Text style={styles.contentText}>
            본 서비스는 간편한 로그인 기능을 위해 카카오톡 계정으로 로그인을
            제공합니다. 카카오톡 로그인을 통해 사용자는 별도의 회원가입 없이
            서비스를 이용할 수 있습니다. 사용자의 카카오톡 계정 정보를 이용하여
            기본 정보(이름, 이메일 등)를 자동으로 가져올 수 있으며, 이는 서비스
            제공 및 고객 지원을 위해 사용될 수 있습니다. 사용자는 언제든지 계정
            설정을 통해 카카오톡 계정 연결을 해제할 수 있습니다.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>제 6조 (서비스 제공의 변경)</Text>
          <Text style={styles.contentText}>
            회사는 서비스 제공의 중단 또는 변경이 불가피한 경우, 사전에 회원에게
            통지하여야 합니다. 천재지변, 시스템 장애, 긴급한 보안 문제 등
            불가항력적인 사유로 사전 통지가 불가능한 경우에는 예외로 합니다.
            서비스 제공의 변경으로 인한 불편함이 최소화되도록 회사는 최선을 다할
            것입니다.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsOfService;

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 20 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  contentText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
});
