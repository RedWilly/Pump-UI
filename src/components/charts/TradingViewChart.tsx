import React, { useEffect, useRef } from 'react';
import { createChart, CrosshairMode, IChartApi, Time } from 'lightweight-charts';

interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface PriceChartProps {
  data: ChartDataPoint[];
}

const PriceChart: React.FC<PriceChartProps> = ({ data }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartContainerRef.current && data.length >= 2) {
      const chart: IChartApi = createChart(chartContainerRef.current, {
        width: chartContainerRef.current.clientWidth,
        height: 500,
        layout: {
          background: { color: '#1f2937' },
          textColor: '#d1d5db',
        },
        grid: {
          vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
          horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
        },
        rightPriceScale: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          visible: true,
          borderVisible: true,
          alignLabels: true,
          scaleMargins: {
            top: 0.1,
            bottom: 0.1,
          },
          autoScale: false,
        },
        timeScale: {
          borderColor: 'rgba(255, 255, 255, 0.2)',
          timeVisible: true,
          secondsVisible: false,
        },
        crosshair: {
          mode: CrosshairMode.Normal,
        },
        watermark: {
          color: 'rgba(255, 255, 255, 0.1)',
          visible: true,
          text: 'Degentralized Funancial',
          fontSize: 28,
          horzAlign: 'center',
          vertAlign: 'center',
        },
      });

      const candleSeries = chart.addCandlestickSeries({
        upColor: '#26a69a',
        downColor: '#ef5350',
        borderVisible: false,
        wickUpColor: '#26a69a',
        wickDownColor: '#ef5350'
      });

      const enhancedChartData = enhanceSmallCandles(data);
      candleSeries.setData(enhancedChartData.map(item => ({
        time: item.time as Time,
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close
      })));

      candleSeries.applyOptions({
        priceFormat: {
          type: 'custom',
          formatter: formatPrice,
          minMove: 1e-9,
        },
      });

      const prices = enhancedChartData.flatMap(item => [item.open, item.high, item.low, item.close]);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);

      const zoomFactor = 0.8;
      const priceRange = maxPrice - minPrice;
      const zoomedMinPrice = Math.max(0, minPrice - priceRange * (1 - zoomFactor) / 2);
      const zoomedMaxPrice = maxPrice + priceRange * (1 - zoomFactor) / 2;

      chart.priceScale('right').applyOptions({
        autoScale: false,
        scaleMargins: {
          top: 0.1,
          bottom: 0.1,
        },
      });

      chart.timeScale().setVisibleRange({
        from: enhancedChartData[0].time as Time,
        to: enhancedChartData[enhancedChartData.length - 1].time as Time,
      });

      const handleResize = () => {
        chart.applyOptions({ width: chartContainerRef.current?.clientWidth || 500 });
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        chart.remove();
      };
    }
  }, [data]);

  if (data.length < 2) {
    return (
      <div className="w-full h-[500px] bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        <p className="text-white text-lg">Not enough data to display chart</p>
      </div>
    );
  }

  return (
    <div ref={chartContainerRef} className="w-full h-[500px] bg-gray-800 rounded-lg overflow-hidden" />
  );
};

function enhanceSmallCandles(data: ChartDataPoint[]): ChartDataPoint[] {
  const minCandleSize = 1e-9;
  return data.map(item => {
    const bodySize = Math.abs(item.open - item.close);
    if (bodySize < minCandleSize) {
      const midPoint = (item.open + item.close) / 2;
      const adjustment = minCandleSize / 2;
      return {
        ...item,
        open: midPoint - adjustment,
        close: midPoint + adjustment,
        high: Math.max(item.high, midPoint + adjustment),
        low: Math.min(item.low, midPoint - adjustment)
      };
    }
    return item;
  });
}

function formatPrice(price: number) {
  return price.toFixed(9);
}

export default PriceChart;