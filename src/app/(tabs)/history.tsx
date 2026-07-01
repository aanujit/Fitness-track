import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, ActivityIndicator } from 'react-native';
import { stepService, StepHistoryRecord } from '@/services/stepService';
import { BarChart } from 'react-native-gifted-charts';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatDateString, getReadableDate } from '@/utils/date';

export default function HistoryScreen() {
  const [history, setHistory] = useState<StepHistoryRecord[]>([]);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterDate, setFilterDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await stepService.getHistory();
      setHistory(data);
    } catch (e: any) {
      setError(e.message || 'Failed to load step history');
    } finally {
      setLoading(false);
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
        {loading ? (
          <ActivityIndicator color="#4ade80" style={{ marginVertical: 30 }} />
        ) : chartData.length > 0 ? (
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

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={loadHistory}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}

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
        {loading ? (
          <ActivityIndicator color="#4ade80" style={{ marginVertical: 20 }} />
        ) : displayedHistory.length > 0 ? (
          displayedHistory.map((item) => (
            <View key={item.date} style={styles.historyCard}>
              <View>
                <Text style={styles.historyDate}>{getReadableDate(item.date)}</Text>
                <Text style={styles.historyGoal}>Goal: {item.goal.toLocaleString()}</Text>
              </View>
              <Text style={[styles.historySteps, { color: item.steps >= item.goal ? '#4ade80' : '#fff' }]}>
                {item.steps.toLocaleString()}
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
  },
  errorContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
});
