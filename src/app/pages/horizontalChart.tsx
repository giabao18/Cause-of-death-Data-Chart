import {
  Checkbox,
  Col,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Typography,
} from 'antd';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import React, { useEffect, useRef, useState } from 'react';
import { IDataType } from './map';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import Chart from 'chart.js/auto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

export const HorizontalChart = () => {
  const [dataMap1, setDataMap1] = useState<Array<IDataType>>();
  const [dataMap2, setDataMap2] = useState<IDataType[]>();
  const [ageRange, setAgeRange] = useState('Age/0-4');
  const [finalData, setFinalData] = useState();
  const [gender, setGender] = useState('Female');

  const [causeOfDeath, setCauseOfDeath] = useState('CDM');
  const [year, setYear] = useState(2015);
  const [run, setRun] = useState(false);
  const chartRef = useRef<HTMLCanvasElement | null>(null);

  const onChangeAgeRange = (e: RadioChangeEvent) => {
    setAgeRange(e.target.value);
  };

  const onChangeGender = (e: RadioChangeEvent) => {
    setGender(e.target.value);
  };

  const onChangeCauseOfDeath = (e: RadioChangeEvent) => {
    setCauseOfDeath(e.target.value);
  };

  const onChangeYear = (e: RadioChangeEvent) => {
    setYear(e.target.value);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Promise.all to make multiple API calls in parallel
        const [response1, response2] = await Promise.all([
          fetch('http://localhost:8000/2015'),
          fetch('http://localhost:8000/2019'),
        ]);

        const result1: IDataType[] = await response1.json();
        const result2: IDataType[] = await response2.json();
        setDataMap1(result1);
        setDataMap2(result2);

        setRun(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const options = {
    indexAxis: 'y' as const,
    elements: {
      bar: {
        borderWidth: 2,
      },
    },
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
      title: {
        display: true,
        text: 'Chart.js Horizontal Bar Chart',
      },
    },
  };

  useEffect(() => {
    if (dataMap1 !== undefined && dataMap2 !== undefined) {
      var dataObject, labels, dataDraw;

      if (year === 2015) {
        dataObject = dataMap1.filter((d) => {
          return d.Gender === gender && d['Cause of death'] === causeOfDeath;
        });

        dataDraw = dataObject.map((d) => {
          var value = d[ageRange as keyof IDataType];
          return value !== 'N/A' ? (+value * 100).toFixed(2) : 0; // Convert to number or set to 0 if 'N/A'
        });

        labels = dataObject.map((d) => d.Country);
      } else if (year === 2019) {
        dataObject = dataMap2.filter((d) => {
          return d.Gender === gender && d['Cause of death'] === causeOfDeath;
        });

        dataDraw = dataObject.map((d) => {
          var value = d[ageRange as keyof IDataType];
          return value !== 'N/A' ? (+value * 100).toFixed(2) : 0; // Convert to number or set to 0 if 'N/A'
        });

        labels = dataObject.map((d) => d.Country);
      }

      if (chartRef.current) {
        // const ctx = document.getElementById('horizontalChart').getContext('2d');
        const existingChart = Chart.getChart(chartRef.current);
        if (existingChart) {
          existingChart.destroy();
        }
        const ctx = chartRef.current.getContext('2d');

        if (ctx)
          new Chart(ctx, {
            type: 'bar', // Set the chart type to horizontalBar
            data: {
              labels: labels,
              datasets: [
                {
                  label: gender,
                  data: dataDraw,
                  backgroundColor: function () {
                    if (gender === 'Male') return 'rgba(255, 99, 132, 0.8)';
                    if (gender === 'Female') return 'rgba(255, 159, 64, 0.8)';
                    else return 'rgba(255, 205, 86, 0.8)';
                  },
               
                },
              ],
            },
            options: {
              indexAxis: 'y',
              scales: {
                x: {
                  beginAtZero: true,
                },
              },
              //   responsive: true,
              maintainAspectRatio: false,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (context) {
                        const label = context.label || '';
                        const value = context.parsed.x || 0;
                        return `${label}: ${value}%`;
                    },
                  },
                },
              },
            },
          });

        const wrapChart = document.querySelector('.wrapChart');
        wrapChart.style.height = '10000px';
        console.log(labels.length);
        // if (labels.length > 20) {
        //   wrapChart.style.height = 900 + (labels.length - 20) * 7  ;
        // }
      }
    }
  }, [run, gender, ageRange, causeOfDeath, year]);

  const drawChart = () => {};

  return (
    <div style={{ height: 1200 }}>
      <Typography.Title
        level={2}
        style={{
          textAlign: 'center',
          margin: '30px 0 20px 0',
          fontWeight: 'bold',
        }}
      >
        World Chart Cause of death in {year}
      </Typography.Title>
      <Row style={{ display: 'flex' }}>
        <Col span={20}>
          <div
            style={{
              height: '85vh',
            }}
          >
            <div
              className="horizontalBar"
              style={{
                margin: '20px 0 0 20px',
                height: '900px',
                maxHeight: '700px',
                overflowY: 'scroll',
                display: 'block',
              }}
            >
              <div className="wrapChart">
                <canvas ref={chartRef} id="horizontalChart"></canvas>
              </div>
            </div>
          </div>
        </Col>
        <Col
          span={4}
          style={{
            display: 'block',
            alignContent: 'center',
            margin: '30px 0 0 0',
            paddingLeft: '10px',
            borderLeft: '1px solid lightGrey',
          }}
        >
          <Typography style={{ margin: '5px 0 5px 5px' }}>
            Filter by
          </Typography>

          <Radio.Group
            onChange={onChangeGender}
            value={gender}
            style={{ width: '100%', margin: '0 0 10px 5px' }}
          >
            <Typography.Title level={4}>Gender</Typography.Title>
            <Space direction="vertical">
              <Radio value={'Female'}>Female</Radio>
              <Radio value={'Male'}>Male</Radio>
              <Radio value={'Total'}>Total</Radio>
            </Space>
          </Radio.Group>

          <Radio.Group
            onChange={onChangeAgeRange}
            value={ageRange}
            style={{ width: '100%', margin: '0 0 10px 5px' }}
          >
            <Typography.Title level={4}>Age</Typography.Title>
            <Space direction="vertical">
              <Radio value={'Age/0-4'}>0-4</Radio>
              <Radio value={'Age/5-14'}>5-14</Radio>
              <Radio value={'Age/15-59'}>15-59</Radio>
              <Radio value={'Age/60+'}>60+</Radio>
              <Radio value={'Age/All age'}>All</Radio>
            </Space>
          </Radio.Group>

          <Radio.Group
            onChange={onChangeCauseOfDeath}
            value={causeOfDeath}
            style={{ width: '100%', margin: '0 0 10px 5px' }}
          >
            <Typography.Title level={4}>Cause of death</Typography.Title>
            <Space direction="vertical">
              <Radio value={'CDM'}>
                Communicable diseases and maternal, prenatal and nutrition
                conditions
              </Radio>
              <Radio value={'Injury'}>Injury</Radio>
              <Radio value={'NCD'}>Non-communicable diseases</Radio>
            </Space>
          </Radio.Group>

          <Radio.Group
            onChange={onChangeYear}
            value={year}
            style={{ width: '100%', margin: '0 0 10px 5px' }}
          >
            <Typography.Title level={4}>Year</Typography.Title>
            <Space direction="vertical">
              <Radio value={2015}>2015</Radio>
              <Radio value={2019}>2019</Radio>
            </Space>
          </Radio.Group>
        </Col>
      </Row>
    </div>
  );
};
