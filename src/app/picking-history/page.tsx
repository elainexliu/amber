'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Link from 'next/link';

interface PickingData {
  time: string;
  picks: number;
}

const timeFrames = ['D', 'W', 'M', '6M'];

export default function PickingHistory() {
  const [timeFrame, setTimeFrame] = useState('D');
  const [data, setData] = useState<PickingData[]>([]);
  const [totalPicks, setTotalPicks] = useState(0);
  const [mostActivePicking, setMostActivePicking] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkForData();
    fetchData(timeFrame, currentDate);
  }, [timeFrame, currentDate]);

  async function checkForData() {
    const { data, error } = await supabase
      .from('picking_events')
      .select('timestamp')
      .limit(1);
  
    if (error) {
      console.error('Error checking for data:', error);
      return;
    }
  
    console.log('Data check result:', data);
    if (data.length === 0) {
      console.log('No data found in the picking_events table.');
    } else {
      console.log('Data found in the picking_events table.');
    }
  }

  async function fetchData(frame: string, date: Date) {
    setIsLoading(true);
    setError(null);
    let startDate: Date;
    let endDate: Date;
    const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  
    switch (frame) {
      case 'D':
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        endDate = endOfDay;
        break;
      case 'W':
        startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59, 999);
        break;
      case 'M':
        startDate = new Date(date.getFullYear(), date.getMonth(), 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case '6M':
        startDate = new Date(date.getFullYear(), date.getMonth() - 5, 1);
        endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      default:
        throw new Error(`Invalid time frame: ${frame}`);
    }
  
    console.log('Querying for date range:', startDate.toISOString(), 'to', endDate.toISOString());
  
    const { data, error } = await supabase
      .from('picking_events')
      .select('timestamp')
      .gte('timestamp', startDate.toISOString())
      .lt('timestamp', endDate.toISOString())
      .order('timestamp', { ascending: true });
      // .limit(10);
  
    console.log('Query result:', data);
    console.log('Query error:', error);
  
    if (error) {
      console.error('Error fetching data:', error);
      setError('Failed to fetch data. Please try again.');
      setIsLoading(false);
      return;
    }
  
    const processedData = processData(data, frame, startDate, endDate);
    console.log('Processed data:', processedData);
  
    setData(processedData);
    setTotalPicks(calculateTotalPicks(processedData));
    setMostActivePicking(calculateMostActivePicking(processedData));
    setIsLoading(false);
  }

  function processData(data: { timestamp: string }[], frame: string, startDate: Date, endDate: Date) {
    /*
    Takes the raw data and transforms it into an array of objects with time and picks properties.
    Handles different time frames (D, W, M, 6M) appropriately.
    */
    let processedData = [];
    let currentDate = new Date(startDate);

    while (currentDate < endDate) {
      let label = '';
      let nextDate = new Date(currentDate);

      switch (frame) {
        case 'D':
          label = currentDate.getHours().toString().padStart(2, '0') + ':00';
          nextDate.setHours(currentDate.getHours() + 1);
          break;
        case 'W':
          label = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][currentDate.getDay()];
          nextDate.setDate(currentDate.getDate() + 1);
          break;
        case 'M':
          label = currentDate.getDate().toString();
          nextDate.setDate(currentDate.getDate() + 1);
          break;
        case '6M':
          label = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][currentDate.getMonth()];
          nextDate.setMonth(currentDate.getMonth() + 1);
          break;
      }

      const picks = data.filter(event => {
        const eventDate = new Date(event.timestamp);
        return eventDate >= currentDate && eventDate < nextDate;
      }).length;

      processedData.push({ time: label, picks: picks });
      currentDate = nextDate;
    }

    return processedData;
  }

  function calculateTotalPicks(data: { picks: number }[]): number {
    return data.reduce((sum, item) => sum + item.picks, 0);
  }

  function calculateMostActivePicking(data: { time: string; picks: number }[]) {
    const maxPicks = Math.max(...data.map(item => item.picks));
    const mostActiveItem = data.find(item => item.picks === maxPicks);
    return mostActiveItem ? mostActiveItem.time : 'N/A';
  }

  function navigateDate(direction: number) {
    const newDate = new Date(currentDate);
    switch (timeFrame) {
      case 'D':
        newDate.setDate(newDate.getDate() + direction);
        break;
      case 'W':
        newDate.setDate(newDate.getDate() + 7 * direction);
        break;
      case 'M':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case '6M':
        newDate.setMonth(newDate.getMonth() + 6 * direction);
        break;
    }
    setCurrentDate(newDate);
  }

  return (
    <div className="min-h-screen bg-amber-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-amber-500">your picking history</h1>
          <Link href="/" className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded transition duration-150 ease-in-out">
            Back to Home
          </Link>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex justify-center space-x-2 mb-4">
            {timeFrames.map((frame) => (
              <button
                key={frame}
                onClick={() => setTimeFrame(frame)}
                className={`px-4 py-2 rounded transition duration-150 ease-in-out ${
                  timeFrame === frame ? 'bg-amber-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
                }`}
              >
                {frame}
              </button>
            ))}
          </div>
          <div className="flex justify-center space-x-4 mb-4">
            <button onClick={() => navigateDate(-1)} className="text-amber-500 hover:text-amber-600 transition duration-150 ease-in-out">Previous</button>
            <span className="font-semibold">{currentDate.toDateString()}</span>
            <button onClick={() => navigateDate(1)} className="text-amber-500 hover:text-amber-600 transition duration-150 ease-in-out">Next</button>
          </div>
          <div className="mb-4 text-center">
            <p className="text-lg">Total <span className="font-bold">{totalPicks}</span> picks {timeFrame === 'D' ? 'today' : `this ${timeFrame}`}</p>
            <p className="text-sm text-gray-600">Most active picking at {mostActivePicking}</p>
          </div>
          {isLoading && <p className="text-center">Loading...</p>}
          {error && <p className="text-center text-red-500">{error}</p>}
          {!isLoading && !error && data.length > 0 && (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="picks" fill="#F59E0B" /> {/* Amber-500 color */}
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {!isLoading && !error && data.length === 0 && (
            <p className="text-center">No data available for the selected time range.</p>
          )}
        </div>
      </div>
    </div>
  );
}