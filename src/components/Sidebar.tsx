import React from 'react';
import { Layout, Menu } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    HomeOutlined,
    DashboardOutlined,
    CalculatorOutlined,
    BarChartOutlined,
    SwapOutlined,
    SettingOutlined,
    DoubleLeftOutlined,
    DoubleRightOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggle }) => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        {
            key: '/',
            icon: <HomeOutlined />,
            label: 'Home',
        },
        {
            key: '/dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard',
        },
        {
            key: '/loans',
            icon: <CalculatorOutlined />,
            label: 'My Loans',
        },
        {
            key: '/analytics',
            icon: <BarChartOutlined />,
            label: 'Analytics',
        },
        {
            key: '/compare',
            icon: <SwapOutlined />,
            label: 'Compare Loans',
        },
        {
            key: '/settings',
            icon: <SettingOutlined />,
            label: 'Settings',
        },
    ];

    const handleMenuClick = ({ key }: { key: string }) => {
        navigate(key);
    };

    return (
        <Sider
            trigger={null}
            collapsible
            collapsed={collapsed}
            className="sidebar"
        >
            <div className="sidebar-header">
                <button
                    className="sidebar-collapse-btn"
                    onClick={onToggle}
                >
                    {collapsed ? <DoubleRightOutlined /> : <DoubleLeftOutlined />}
                </button>
            </div>

            <Menu
                mode="inline"
                items={menuItems}
                className="sidebar-menu"
                theme="light"
                selectedKeys={[location.pathname]}
                onClick={handleMenuClick}
            />
        </Sider>
    );
};
