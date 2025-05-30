import React from 'react';
import { View } from 'react-native';

const Line = ({
    color = '#e5e7eb',
    thickness = 1,
    style = 'solid',
    orientation = 'horizontal',
    length = '100%',
    margin = 0,
    marginVertical = 0,
    marginHorizontal = 0,
    className = '',
    ...props
}) => {
    const getLineStyle = () => {
        const baseStyle = {
            backgroundColor: style === 'solid' ? color : 'transparent',
        };

        if (orientation === 'horizontal') {
            return {
                ...baseStyle,
                height: thickness,
                width: length,
                marginVertical: marginVertical || margin,
                marginHorizontal: marginHorizontal,
                ...(style === 'dashed' && {
                    borderTopWidth: thickness,
                    borderTopColor: color,
                    borderStyle: 'dashed',
                    backgroundColor: 'transparent',
                }),
                ...(style === 'dotted' && {
                    borderTopWidth: thickness,
                    borderTopColor: color,
                    borderStyle: 'dotted',
                    backgroundColor: 'transparent',
                }),
            };
        } else {
            // vertical
            return {
                ...baseStyle,
                width: thickness,
                height: length,
                marginHorizontal: marginHorizontal || margin,
                marginVertical: marginVertical,
                ...(style === 'dashed' && {
                    borderLeftWidth: thickness,
                    borderLeftColor: color,
                    borderStyle: 'dashed',
                    backgroundColor: 'transparent',
                }),
                ...(style === 'dotted' && {
                    borderLeftWidth: thickness,
                    borderLeftColor: color,
                    borderStyle: 'dotted',
                    backgroundColor: 'transparent',
                }),
            };
        }
    };

    return (
        <View
            className={className}
            style={[getLineStyle(), props.style]}
            {...props}
        />
    );
};

// Pre-built common line variants
export const HorizontalLine = (props) => (
    <Line orientation="horizontal" {...props} />
);

export const VerticalLine = (props) => (
    <Line orientation="vertical" {...props} />
);

export const Divider = ({
    color = '#e5e7eb',
    thickness = 1,
    margin = 16,
    className = '',
    ...props
}) => (
    <Line
        orientation="horizontal"
        color={color}
        thickness={thickness}
        margin={margin}
        className={className}
        {...props}
    />
);

export const Separator = ({
    color = '#f3f4f6',
    thickness = 8,
    marginVertical = 24,
    className = '',
    ...props
}) => (
    <Line
        orientation="horizontal"
        color={color}
        thickness={thickness}
        marginVertical={marginVertical}
        className={className}
        {...props}
    />
);

// Dark mode variants
export const DarkLine = ({ isDark = false, ...props }) => {
    const darkColor = isDark ? '#374151' : '#e5e7eb';
    return <Line color={darkColor} {...props} />;
};

export const DarkDivider = ({ isDark = false, ...props }) => {
    const darkColor = isDark ? '#374151' : '#e5e7eb';
    return <Divider color={darkColor} {...props} />;
};

export default Line;