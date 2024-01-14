'use client';
import { assets } from '@/assets/assets';
import styles from './page.module.scss';
import {
  PieChartOutlined,
  DesktopOutlined,
  ContainerOutlined,
  MailOutlined,
  AppstoreOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { Avatar, Button, Col, Menu, MenuProps, Row } from 'antd';
import MenuItem from 'antd/es/menu/MenuItem';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import WorldMap from '../pages/map';
import { HorizontalBar } from '../pages/horizontalBar';
import { HorizontalChart } from '../pages/horizontalChart';

type MenuItem = Required<MenuProps>['items'][number];

function getItem(
  label: React.ReactNode,
  key: React.Key,
  icon?: React.ReactNode,
  children?: MenuItem[],
  type?: 'group',
): MenuItem {
  return {
    key,
    icon,
    children,
    label,
    type,
  } as MenuItem;
}

const items: MenuItem[] = [
  getItem('Home', '1', <MailOutlined />),
  getItem('Charts', '2', <AppstoreOutlined />, [
    getItem('Maps', '3'),
    getItem('Bar chart', '4'),
  ]),
  getItem('Profile', 'sub3', <SettingOutlined />, [
    getItem('Settings', '9'),
    getItem('Log out', '10'),
  ]),
];

type Props = {};

export default function HomePage({}: Props) {
  const [collapsed, setCollapsed] = useState(false);

  // async function data() {
  //   await base

  // }

  return (
    <>
      <Row>
        <Col className={styles.leftPanel} span={4}>
          <div className={styles.leftPanel_websiteLogo}>
            <Image alt="logo" src={assets.websiteLogo} />
          </div>
          <Menu
            className={styles.leftPanel_menu}
            mode="inline"
            items={items}
          />
        </Col>

        <Col span={20}>
          {/* <WorldMap /> */}
          <HorizontalChart />
        </Col>
      </Row>
    </>
  );
}
