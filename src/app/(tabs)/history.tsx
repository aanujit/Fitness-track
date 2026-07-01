import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { stepService, StepHistoryRecord } from '@/services/stepService';
import { BarChart } from 'react-native-gifted-charts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateString, getReadableDate } from '@/utils/date';

export default function HistoryScreen() {
  const [history, setHistory] = useState<StepHistoryRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    // Generate mock history if empty for testing purposes
    const data = await stepService.getHistory();
    if (data.length === 0) {
      await stepService.generateMockHistory();
      const mockData = await stepService.getHistory();
      setHistory(mockData);
    } else {
      setHistory(data);
    }
  };

  const displayedHistory = useMemo(() => {
    let filtered = [...history];
    if (filterDate) {
      const filterStr = formatDateString(filterDate);
      filtered = filtered.filter(item => item.date === filterStr);
    }

    return filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }, [history, sortOrder, filterDate]);

  const chartData = useMemo(() => {
    // Last 7 days, oldest first for chart
    const last7 = [...history]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7);

    return last7.map(item => ({
      value: item.steps,
      label: item.date.slice(5), // MM-DD
      frontColor: item.steps >= item.goal ? '#4ade80' : '#4ade8055',
    }));
  }, [history]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setFilterDate(selectedDate);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Weekly Summary</Text>
      <View style={styles.chartContainer}>
        {chartData.length > 0 ? (
          <BarChart
            data={chartData}
            barWidth={22}
            noOfSections={4}
            barBorderRadius={4}
            frontColor="#4ade80"
            yAxisThickness={0}
            xAxisThickness={1}
            xAxisColor="#555"
            yAxisTextStyle={{ color: '#aaa' }}
            xAxisLabelTextStyle={{ color: '#aaa', fontSize: 10 }}
            hideRules
          />
        ) : (
          <Text style={styles.emptyText}>No data available for chart</Text>
        )}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
        >
          <Text style={styles.controlText}>
            Sort: {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlBtn} 
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.controlText}>
            {filterDate ? formatDateString(filterDate) : 'Filter Date'}
          </Text>
        </TouchableOpacity>

        {filterDate && (
          <TouchableOpacity 
            style={[styles.controlBtn, { backgroundColor: '#ef4444' }]} 
            onPress={() => setFilterDate(null)}
          >
            <Text style={styles.controlText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={filterDate || new Date()}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      <Text style={styles.title}>History Log</Text>
      <View style={styles.list}>
        {displayedHistory.length > 0 ? (
          displayedHistory.map((item, index) => (
            <View key={index} style={styles.historyCard}>
              <View>
                <Text style={styles.historyDate}>{getReadableDate(item.date)}</Text>
                <Text style={styles.historyGoal}>Goal: {item.goal}</Text>
              </View>
              <Text style={[styles.historySteps, { color: item.steps >= item.goal ? '#4ade80' : '#fff' }]}>
                {item.steps}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No records found</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
    marginTop: 10,
  },
  chartContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 20,
    paddingRight: 10,
    marginBottom: 30,
    alignItems: 'center',
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  controlBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
  },
  controlText: {
    color: '#fff',
    fontWeight: '600',
  },
  list: {
    gap: 15,
  },
  historyCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  historyGoal: {
    fontSize: 12,
    color: '#aaa',
  },
  historySteps: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  emptyText: {
    color: '#aaa',
    textAlign: 'center',
    marginVertical: 20,
  }
});
