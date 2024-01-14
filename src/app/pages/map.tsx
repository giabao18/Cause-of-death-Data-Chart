'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import {
  FeatureCollection,
  Feature,
  Geometry,
  GeoJsonProperties,
} from 'geojson';
import { Col, Radio, RadioChangeEvent, Row, Space, Typography } from 'antd';
import { Input } from 'postcss';
import test from 'node:test';
// import topojson from 'topojson-client';

interface IDataType {
  'Country Code': string;
  Country: string;
  Year: number;
  'Cause of death': string;
  Gender: string;
  'Age/0-4': number;
  'Age/5-14': number;
  'Age/15-59': number;
  'Age/60+': number;
  'Age/All age': number;
}

const WorldMap = () => {
  const [dataMap1, setDataMap1] = useState();
  const [dataMap2, setDataMap2] = useState();
  const [dataMap3, setDataMap3] = useState();
  // const svgRef = useRef(null);
  const [ageRange, setAgeRange] = useState('Age/0-4');
  const [gender, setGender] = useState('Female');
  const [causeOfDeath, setCauseOfDeath] = useState('CDM');
  const [year, setYear] = useState(2015);
  const [run, setRun] = useState(false);

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
        const [response1, response2, response3] = await Promise.all([
          fetch(
            'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
          ),
          fetch('http://localhost:8000/2015'),
          fetch('http://localhost:8000/2019'),
        ]);

        const result1 = await response1.json();
        const result2 = await response2.json();
        const result3 = await response3.json();
        setDataMap1(result1);
        setDataMap2(result2);
        setDataMap3(result3);
        setRun(true);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    var padding = { top: 50, right: 30, bottom: 100, left: 20 },
      width = 1200,
      height = 800;

    const svg = d3
      .select('.mapDraw')
      .attr('width', '100%')
      .attr('height', '100%');
    // .attr('transform', 'translate(' + padding.left + ',' + padding.top + ')');

    svg.selectAll('path').remove();

    // Promise.all([
    //   d3.json(
    //     'https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson',
    //   ),
    //   d3.json('http://localhost:8000/2019'),
    // ]).then(function (loadData) {

    // const dataValue: Array<IDataType> = loadData[1] as Array<IDataType>;
    // let topo: FeatureCollection = loadData[0] as FeatureCollection;
    if (
      dataMap1 !== undefined &&
      dataMap2 !== undefined &&
      dataMap3 !== undefined
    ) {
      var dataValue: Array<IDataType>;
      if (year === 2015) dataValue = dataMap2 as Array<IDataType>;
      else if (year === 2019) dataValue = dataMap3 as Array<IDataType>;

      let topo: FeatureCollection = dataMap1 as FeatureCollection;

      // map topo add case to2019
      topo.features.map((d) => {
        let valueTemp = dataValue.find((data: IDataType) => {
          return (
            data['Country Code'] === d.id &&
            data['Cause of death'] == causeOfDeath &&
            data.Gender == gender
          );
        });

        var caseValue: any = valueTemp
          ? valueTemp[ageRange as keyof IDataType]
          : 0;
        if (caseValue == 'N/A') caseValue = 0;
        (d.properties as any).case = (caseValue * 100).toFixed(2);
        (d.properties as any).gender = gender;
        (d.properties as any).causeOfDeath = causeOfDeath;
        (d.properties as any).year = year;
      });

      // Zoom map
      const zoomed = (event: any) => {
        // Update the projection on zoom
        const newTransform = event.transform;
        projection
          .scale(newTransform.k * scale)
          .translate([newTransform.x, newTransform.y]);
        path = d3.geoPath().projection(projection);

        // Update paths with the new projection
        svg.selectAll('path').attr('d', path);
      };

      const zoomMap: any = d3.zoom().on('zoom', zoomed);

      // Attach zoom behavior to the SVG container
      svg.call(zoomMap);

      // Color of map
      var colorScheme: readonly string[];

      if (gender === 'Female') {
        colorScheme = d3.schemeBlues[9];
      } else if (gender === 'Male') {
        colorScheme = d3.schemeOranges[9];
      } else {
        colorScheme = d3.schemePurples[9];
      }
      var colorScale = d3
        .scaleThreshold<number, string>()
        .domain([0, 5, 10, 20, 30, 40, 50, 60, 70])
        .range(colorScheme);

      // Data and color scale

      // Calculate center and scale based on the bounding box
      var scale = 100;
      var center = d3.geoCentroid(topo);
      var projection = d3
        .geoMercator()
        .scale(scale)
        // .center([0, 0])
        .center(center)
        .translate([width / 2, height / 2]);

      // create the path
      var path = d3.geoPath().projection(projection);

      // using the path determine the bounds of the current map and use
      // these to determine better values for the scale and translation
      var bounds = path.bounds(topo);
      var hscale = (scale * width) / (bounds[1][0] - bounds[0][0]);
      var vscale = (scale * height) / (bounds[1][1] - bounds[0][1]);
      scale = hscale < vscale ? hscale : vscale;

      // // new projection
      projection = d3
        .geoMercator()
        .center(center)
        .scale(scale)
        .translate([
          width - (bounds[0][0] + bounds[1][0]) / 2,
          height - (bounds[0][1] + bounds[1][1]) / 2,
        ]);
      path = path.projection(projection);

      // add a rectangle to see the bound of the svg
      // svg
      //   .append('rect')
      //   .attr('width', width)
      //   .attr('height', height)
      //   .style('stroke', 'black')
      //   .style('fill', 'none');

      const Tooltip = d3.select('.tooltip');

      svg
        .selectAll('path')
        .data(topo.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', (d) => {
          console.log(colorScheme);
          return colorScale(Number(d.properties?.case));
        })
        .style('stroke', 'transparent')
        .attr('class', function (d) {
          return 'Country';
        })
        .style('opacity', 0.8)
        .on('mouseover', function (event, d) {
          mouseOver.call(this, event, d);
        })
        .on('mouseleave', function (event, d) {
          mouseLeave.call(this, event, d);
        });

      let mouseOver = function (
        this: Element,
        event: any,
        d: Feature<Geometry, GeoJsonProperties>,
      ) {
        // Highlight the country

        d3.selectAll('.Country').style('opacity', 0.5);
        d3.select(this as HTMLElement)
          .style('opacity', 1)
          .style('stroke', 'black');
        // Show tooltip on mouseover
        Tooltip.style('opacity', 1)
          .html(
            `<strong>${d.properties?.causeOfDeath}, ${d.properties?.gender} (% of ${d.properties?.gender} population) </strong><br> <strong>${d.properties?.name},${d.properties?.year}:  ${d.properties?.case}%`,
          )
          .style('left', event.pageX - 250 + 'px')
          .style('top', event.pageY - 100 + 'px');
      };

      let mouseLeave = function (this: Element, event: any, d: any) {
        // Hide tooltip on mouseleave
        Tooltip.style('opacity', 0);
        // Reset country styles
        d3.selectAll('.Country').style('opacity', 0.8);
        d3.select(this as HTMLElement)
          .transition()
          .duration(200)
          .style('stroke', 'transparent');
      };
    }
  }, [run, gender, ageRange, causeOfDeath, year]);

  return (
    <div>
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
            className="map"
            style={{ margin: '20px 0 0 20px', height: '85vh' }}
          >
            <svg className="mapDraw"></svg>
            <div
              className="tooltip"
              style={{
                opacity: '0',
                backgroundColor: '#5493C3',
                position: 'absolute',
                borderRadius: '5px',
                padding: '10px',
              }}
            ></div>
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
          <Typography  style={{margin: '5px 0 5px 5px'}}>Filter by</Typography>
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

export default WorldMap;
