import { Badge, Button } from '@rneui/themed';
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import moment from 'moment';
import Icon from 'react-native-vector-icons/FontAwesome';
import Fonts from '../../../../assets/fonts/Fonts';
import { BCarefulTheme, style } from '../../../component/Theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CustomHeader } from '../../../component/Header';
import { useNavigation } from '@react-navigation/native';

function LichThuocScreen() {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [medicationStatus, setMedicationStatus] = useState({});
  const [currentTimePeriod, setCurrentTimePeriod] = useState('');

  const handleMedication = medication => {
    setSelectedMedication(medication);
    setModalVisible(true);
  };

  useEffect(() => {
    scrollToSelectedDate();
    determineTimePeriod();
  }, [selectedDate]);

  const scrollToSelectedDate = () => {
    const index = weekDays.findIndex(day =>
      day.date.isSame(selectedDate, 'day'),
    );
    if (index !== -1) {
      flatListRef.current.scrollToIndex({ animated: true, index: index - 3 });
    }
  };

  const determineTimePeriod = () => {
    const currentHour = moment().hour();
    if (currentHour < 11) {
      setCurrentTimePeriod('morning');
    } else if (currentHour >= 11 && currentHour < 13) {
      setCurrentTimePeriod('noon');
    } else if (currentHour >= 13 && currentHour < 18) {
      setCurrentTimePeriod('afternoon');
    } else if (currentHour >= 18 && currentHour < 24) {
      setCurrentTimePeriod('evening');
    } else {
      setCurrentTimePeriod('');
    }
  };

  const renderDay = ({ item }) => {
    const isSelected = item.date.isSame(selectedDate, 'day');
    const dayStyle = isSelected
      ? [style.t1, style.primary]
      : [style.t2]
    const dateStyle = isSelected
      ? [style.h7, style.primary]
      : [style.t1]
    const containerStyle = isSelected
      ? styles.dayContainerSelected
      : styles.dayContainer;

    return (
      <TouchableOpacity onPress={() => setSelectedDate(item.date)}>
        <View style={containerStyle}>
          <Text style={dayStyle}>{item.day}</Text>
          <Text style={dateStyle}>{item.date.format('DD')}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const generateWeekDays = date => {
    const startOfWeek = moment(date).startOf('isoWeek');
    return Array.from({ length: 14 }).map((_, index) => {
      const day = moment(startOfWeek).add(index - 7, 'days');
      return {
        day: day.format('dd').toUpperCase(),
        date: day,
        isToday: day.isSame(moment(), 'day'),
      };
    });
  };
  const weekDays = generateWeekDays(selectedDate);

  const medications = [
    {
      id: 1,
      name: 'Cetirizin dihydrochlorid',
      time: '08:00',
      dosage: 'Uống 1 viên trước ăn',
    },
    {
      id: 2,
      name: 'Cetirizin dihydrochlorid',
      time: '09:00',
      dosage: 'Uống 2 viên sau ăn',
    },
    { id: 3, name: 'Ibuprofen', time: '11:00', dosage: 'Uống 1 viên sau ăn' },
    { id: 4, name: 'Paracetamol', time: '14:00', dosage: 'Uống 2 viên sau ăn' },
    { id: 5, name: 'Amoxicillin', time: '19:00', dosage: 'Uống 1 viên trước ăn' },
  ];

  const filterMedicationsByTime = (startHour, endHour) => {
    return medications.filter(med => {
      const medHour = moment(med.time, 'HH:mm').hour();
      return medHour >= startHour && medHour < endHour;
    });
  };

  const handleMedicationAction = action => {
    setMedicationStatus(prevStatus => ({
      ...prevStatus,
      [selectedMedication.id]: action,
    }));
    setModalVisible(false);
  };

  const renderMedicationStatus = medicationId => {
    const status = medicationStatus[medicationId];
    if (status === 'taken') {
      return <Icon name="check-circle" size={24} color={BCarefulTheme.colors.green} />;
    } else if (status === 'skipped') {
      return <Icon name="times-circle" size={24} color={BCarefulTheme.colors.red} />;
    }
    return <Icon name="circle-o" size={24} color="grey" />;
  };

  const renderMedicationCard = (title, meds, timePeriod, index) => {
    if (meds.length === 0) return null;

    let source;
    switch (timePeriod) {
      case 'morning':
        source = require('../../../../assets/images/morning.png');
        break;
      case 'noon':
        source = require('../../../../assets/images/noon.png');
        break;
      case 'afternoon':
        source = require('../../../../assets/images/afternoon.png');
        break;
      case 'evening':
        source = require('../../../../assets/images/evening.png');
        break;
      default:
        source = null;
    }

    // Sử dụng chỉ số để xác định kiểu thẻ
    const cardStyle = index % 2 === 0 ? style.cardLeft : style.cardRight;

    return (
      <View style={[cardStyle, currentTimePeriod === timePeriod ? { borderColor: BCarefulTheme.colors.secondary, borderBottomWidth: 7, elevation: 4 , backgroundColor: 'white' } : {}]}>
        <Text style={style.h7}>{title}</Text>
        {source && (
          <Image
            source={source}
            style={index % 2 === 0 ? styles.iconLeft : styles.iconRight}
          />
        )}
        {meds.map(med => (
          <View key={med.id} style={style.spacebtw}>
            {index % 2 === 0 ? (
              <>
                <View style={[style.m2, style.mx4]}>
                  {renderMedicationStatus(med.id)}
                </View>
                <TouchableOpacity
                  style={styles.medicationItem}
                  onPress={() => handleMedication(med)}>
                  <Text style={style.h7}>{med.name}</Text>
                  <Text style={style.t2}>
                    <Text style={[style.h6, currentTimePeriod === timePeriod ? style.sub : {}]}>
                      {med.time}
                    </Text>
                    {''} - {med.dosage}
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={styles.medicationItem}
                  onPress={() => handleMedication(med)}>
                  <Text style={[style.h7, style.end]}>{med.name}</Text>
                  <Text style={[style.t2, style.end]}>
                    <Text style={[style.h6, currentTimePeriod === timePeriod ? style.sub : {}]}>
                      {med.time}
                    </Text>
                    {''} - {med.dosage}
                  </Text>
                </TouchableOpacity>
                <View style={[style.m2, style.mx4]}>
                  {renderMedicationStatus(med.id)}
                </View>
              </>
            )}
          </View>
        ))}
      </View>
    );
  };


  const morningMeds = filterMedicationsByTime(0, 11);
  const noonMeds = filterMedicationsByTime(11, 13);
  const afternoonMeds = filterMedicationsByTime(13, 18);
  const eveningMeds = filterMedicationsByTime(18, 24);

  const noMedications =
    morningMeds.length === 0 &&
    noonMeds.length === 0 &&
    afternoonMeds.length === 0 &&
    eveningMeds.length === 0;

  const renderCards = () => {
    const cards = [
      { title: 'Buổi sáng', meds: morningMeds, timePeriod: 'morning' },
      { title: 'Buổi trưa', meds: noonMeds, timePeriod: 'noon' },
      { title: 'Buổi chiều', meds: afternoonMeds, timePeriod: 'afternoon' },
      { title: 'Buổi tối', meds: eveningMeds, timePeriod: 'evening' },
    ];

    const card2 = cards.filter(card => card.meds.length > 0);

    return card2.map((card, index) =>
      renderMedicationCard(card.title, card.meds, card.timePeriod, index)
    );
  };

  const calendarBtn = () => {
    return (
      <TouchableOpacity
        onPress={() => { }}>
        <Icon name="calendar" type="ionicon" color={BCarefulTheme.colors.primary} size={24} />
      </TouchableOpacity>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.fixedHeader}>
        <CustomHeader title={'Lịch sử dụng thuốc'} rightIcon={calendarBtn} />

        <FlatList
          ref={flatListRef}
          data={weekDays}
          renderItem={renderDay}
          keyExtractor={item => item.date.toString()}
          horizontal
          style={styles.calendar}
          showsHorizontalScrollIndicator={false}
          initialScrollIndex={7}
          getItemLayout={(data, index) => ({
            length: 50,
            offset: 50 * index,
            index,
          })}
        />

        <Text style={[style.h7, { backgroundColor: BCarefulTheme.colors.background, textAlign: 'center' }]}>
          {selectedDate.isSame(moment(), 'day') ? 'Hôm nay, ' : ''}
          Ngày {selectedDate.format('DD')} tháng {selectedDate.format('MM')},{' '}
          {selectedDate.format('YYYY')}
        </Text>

        <View style={styles.actionButtons}>
          <Button
            title="NGỪNG TẤT CẢ"
            titleStyle={style.h8}
            buttonStyle={[style.btnOutlineSub, { paddingHorizontal: 0, width: 130 }]}
            onPress={() => { }}
          />
          <Button
            title="DÙNG TẤT CẢ"
            titleStyle={[style.h8, style.white]}
            buttonStyle={[style.btnSub, { width: 130 }]}
            onPress={() => { }}
          />
        </View>
      </View>

      <ScrollView style={styles.scrollContainer}>
        <Text style={styles.patientName}>LÊ DUY NGUYÊN (N23-0253996)</Text>
        {renderCards()}
        {noMedications && (
          <Text style={styles.noMedicationText}>Bạn chưa có lịch nào</Text>
        )}

        <Button
          title="Quản lý toa thuốc"
          buttonStyle={[style.btn, style.m3]}
          onPress={() => {navigation.navigate('QuanLyThuoc')}}
        />
      </ScrollView>

      {/* Modal */}
      {selectedMedication && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <View style={styles.modalContainer}>
            <View style={styles.modalView}>
              <Text style={style.h2}>Xác nhận uống thuốc</Text>
              <Text style={style.t1}>
                LÊ DUY NGUYÊN (N23-0253996)
              </Text>
              <Text style={style.h4}>
                {selectedMedication.name}
              </Text>
              <Text style={[style.t2, style.grey, style.mb4]}>
                {selectedMedication.time} - {selectedMedication.dosage}
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={style.btnDisable}
                  onPress={() => handleMedicationAction('skipped')}>
                  <Text style={[style.h8, style.white]}>Bỏ qua</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={style.btnSub}
                  onPress={() => handleMedicationAction('taken')}>
                  <Text style={[style.h8, style.white]}>Dùng thuốc</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={style.btn}
                  onPress={() => {
                    /* logic điều chỉnh */
                  }}>
                  <Text style={[style.h8, style.white]}>Điều chỉnh</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  fixedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1,
  },
  calendar: {
    backgroundColor: BCarefulTheme.colors.background,
    paddingVertical: 10,
  },
  dayContainer: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayContainerSelected: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: BCarefulTheme.colors.primary,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: BCarefulTheme.colors.background,
    borderBottomColor: BCarefulTheme.colors.border,
    borderBottomWidth: 1,
  },
  scrollContainer: {
    flex: 1,
    marginTop: 210, // Adjust this value based on the height of the fixed header
  },
  patientName: {
    fontSize: 16,
    fontFamily: Fonts.bold,
  },
  medicationItem: {
    flexDirection: 'column',
    flex: 1,
  },
  noMedicationText: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 20,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    width: '95%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#999',
  },
  iconRight: {
    width: 70,
    height: 70,
    position: 'absolute',
    left: 10,
    top: 10,
  },
  iconLeft: {
    width: 70,
    height: 70,
    position: 'absolute',
    right: 10,
    top: 10,
  }
});


export default LichThuocScreen;