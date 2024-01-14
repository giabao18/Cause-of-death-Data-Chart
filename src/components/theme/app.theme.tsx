'use client';

import { ThemeConfig, ConfigProvider } from 'antd';
import { ComponentType, ReactNode } from 'react';

export const configTheme: ThemeConfig = {
  components: {
    Button: {
      colorPrimary: '#504099',
      algorithm: true,
    },
    Menu: {
      itemColor: '#ffffff',
      itemSelectedBg: '#384495',
      itemSelectedColor: '#ffffff',
    }
  }
};


