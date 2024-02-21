import AppHeader from '@/components/header/app.header';
import { Button, ConfigProvider, Layout } from 'antd';
import Image from 'next/image';
import HomePage from './layout/layout';
import { configTheme } from '@/components/theme/app.theme';

export default function Home() {
  return (
    <ConfigProvider theme={configTheme}>
      <HomePage />
    </ConfigProvider>
  );
}
