import {
  Checkbox,
  Col,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Typography,
} from 'antd';
import { CheckboxChangeEvent } from 'antd/es/checkbox';
import { CheckboxValueType } from 'antd/es/checkbox/Group';
import * as d3 from 'd3';
import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from 'geojson';
import React, { useEffect, useState } from 'react';
import { IDataType } from './map';

type Props = {};

export const HorizontalBar = () => {
  const [dataMap1, setDataMap1] = useState();
  const [dataMap2, setDataMap2] = useState();
  const [ageRange, setAgeRange] = useState('Age/0-4');
  const [gender, setGender] = useState<CheckboxValueType[]>([
    'Female',
    'Male',
    'Total',
  ]);
  const [causeOfDeath, setCauseOfDeath] = useState('CDM');
  const [year, setYear] = useState(2015);
  const [run, setRun] = useState(false);

  const onChangeAgeRange = (e: RadioChangeEvent) => {
    setAgeRange(e.target.value);
  };

  const onChangeGender = (checkedValue: CheckboxValueType[]) => {
    setGender(checkedValue);
  };

  const onChangeCauseOfDeath = (e: RadioChangeEvent) => {
    setCauseOfDeath(e.target.value);
  };

  const onChangeYear = (e: RadioChangeEvent) => {
    setYear(e.target.value);
  };
  console.log(gender);
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Use Promise.all to make multiple API calls in parallel
        const [response1, response2] = await Promise.all([
          fetch('http://localhost:8000/2015'),
          fetch('http://localhost:8000/2019'),
        ]);

        const result1 = await response1.json();
        const result2 = await response2.json();
        setDataMap1(result1);
        setDataMap2(result2);
        setRun(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    var margin = { top: 50, right: 30, bottom: 100, left: 20 },
      width = 1200,
      height = 800;

    var totalWidth = width * 6;
    var container = d3.select('.horizontalBar');

    // var svg = d3
    //   .select('.horizontalBarDraw')
    //   .attr('width', '100%')
    //   .attr('height', '100%')
    //   .attr('display', 'block');

    // d3.select('.horizontalBarDraw').selectAll('path').remove();

    if (dataMap1 !== undefined && dataMap2 !== undefined) {
      var dataValue: Array<IDataType>;
      if (year === 2015) dataValue = dataMap1 as Array<IDataType>;
      else if (year === 2019) dataValue = dataMap2 as Array<IDataType>;

      // Add X axis
      var x = d3.scaleLinear().domain([0, 100]).range([0, width]);

      // Y axis
      var y = d3
        .scaleBand()
        .range([0, height])
        .domain(
          dataValue.map(function (d) {
            return d.Country;
          }),
        )
        .padding(0.1);

      //   // XAxis SVG
      //   svg
      //     .append('svg')
      //     .attr('width', width)
      //     .attr('height', height)
      //     .style('position', 'absolute')
      //     .style('pointer-events', 'none')
      //     .style('z-index', 1)
      //     .attr('transform', `translate(0, 0)`)
      //     .call(d3.axisTop(x))
      //     .selectAll('text')
      //     .style('text-anchor', 'end')
      //     .call((g) => g.select('.domain').remove())
      //     .call((g) =>
      //       g
      //         .select('.tick:last-of-type text')
      //         .clone()
      //         .attr('x', 3)
      //         .attr('text-anchor', 'start')
      //         .attr('font-weight', 'bold')
      //         .text('$ Close'),
      //     );

      //     const x = d3.scaleUtc()
      //     .domain(d3.extent(data, d => d.date) as [Date, Date])
      //     .range([marginLeft, totalWidth - marginRight]);

      //   const y = d3.scaleLinear()
      //     .domain([0, d3.max(data, d => d.close) as number]).nice(6)
      //     .range([height - marginBottom, marginTop]);

      container.select('svg').remove(); // Clear existing chart

      // Create the svg with the horizontal x-axis at the top.
      const svg = container
        .append('svg')
        .attr('width', '100%')
        // .attr('height', '100%')
        .style('position', 'absolute')
        .style('pointer-events', 'none')
        .style('z-index', 1)
        .append('g')
        .attr('transform', `translate(0,${margin.top})`) // Move the x-axis to the top
        .call(d3.axisTop(x))
        .call((g) => g.select('.domain').remove())
        .call((g) =>
          g
            .select('.tick:last-of-type text')
            .clone()
            .attr('y', 3)
            .attr('text-anchor', 'start')
            .attr('font-weight', 'bold')
            .text('$ Close'),
        );

      // Create a scrolling div containing the bar chart and the horizontal axis.
      const body = container
        .append('div')
        .style('overflow-y', 'scroll')
        .style('-webkit-overflow-scrolling', 'touch')
        .style('display', 'block');

      const svgChart = body
        .append('svg')
        .attr('width', '100%')
        .attr('height', height * 6);
      // .style('display', 'block');

      svgChart
        .selectAll('rect')
        .data(dataValue)
        .enter()
        .append('rect')
        .attr('x', (d) => x(d['Age/0-4'])!)
        .attr('y', (d) => y(d.Country)!)
        .attr('height', (height * 6 - margin.top - margin.bottom) / 200) // Adjust width based on data length
        .attr('width', (d) => width - margin.left - x(d['Age/0-4'])!)
        .attr('fill', 'steelblue');

      // Initialize the scroll offset after yielding the chart to the DOM.
      body.node()?.scrollBy(totalWidth, 0);
    }
  }, [run, gender, ageRange, causeOfDeath, year]);

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
        World Map Cause of death in {year}
      </Typography.Title>
      <Row style={{ display: 'flex' }}>
        <Col span={20}>
          <div
            className="horizontalBar"
            style={{
              margin: '20px 0 0 20px',
              height: '85vh',
              display: 'block',
            }}
          >
            {/* <svg className="xAxis"></svg>
            <div className="scroll"></div> */}
            <svg className="horizontalBarDraw"></svg>
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

          <Typography.Title
            level={4}
            style={{ width: '100%', margin: '0 0 10px 5px' }}
          >
            Gender
          </Typography.Title>
          <Checkbox.Group
            onChange={onChangeGender}
            defaultValue={['Female', 'Male', 'Total']}
            style={{ width: '100%', margin: '0 0 10px 5px' }}
          >
            <Space direction="vertical">
              <Checkbox value={'Female'} defaultChecked>
                Female
              </Checkbox>
              <Checkbox value={'Male'}>Male</Checkbox>
              <Checkbox value={'Total'}>Total</Checkbox>
            </Space>
          </Checkbox.Group>

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
