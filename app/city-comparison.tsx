'use client';

import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

type CityDatum = {
  code: string;
  city: string;
  generalHouseholds: number;
  singleHouseholds: number;
  singleShare: number;
  shareRank: number;
  countRank: number;
};

type Metric = 'share' | 'count';

const formatInteger = new Intl.NumberFormat('ja-JP');
const formatShare = (value: number) => `${value.toFixed(1)}%`;

export default function CityComparison() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<CityDatum[]>([]);
  const [width, setWidth] = useState(920);
  const [metric, setMetric] = useState<Metric>('share');
  const [selectedCity, setSelectedCity] = useState('調布市');
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  useEffect(() => {
    const dataUrl = new URL('data/tama-single-households.csv', document.baseURI).href;

    d3.csv<CityDatum>(dataUrl, (row) => ({
      code: row.code,
      city: row.city,
      generalHouseholds: Number(row.generalHouseholds),
      singleHouseholds: Number(row.singleHouseholds),
      singleShare: Number(row.singleShare),
      shareRank: Number(row.shareRank),
      countRank: Number(row.countRank),
    })).then(setData);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.max(320, Math.round(entry.contentRect.width)));
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeCityName = hoveredCity ?? selectedCity;
  const active = useMemo(
    () => data.find((city) => city.city === activeCityName),
    [activeCityName, data],
  );
  const chofu = useMemo(() => data.find((city) => city.city === '調布市'), [data]);

  const shareMedian = useMemo(() => {
    const values = data.map((city) => city.singleShare).sort(d3.ascending);
    return values.length ? d3.median(values) ?? 0 : 0;
  }, [data]);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const compact = width < 640;
    const margin = { top: 42, right: compact ? 26 : 54, bottom: 52, left: compact ? 78 : 104 };
    const rowHeight = compact ? 26 : 28;
    const height = margin.top + margin.bottom + rowHeight * data.length;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const accessor = (city: CityDatum) => metric === 'share' ? city.singleShare : city.singleHouseholds;
    const sorted = [...data].sort((a, b) => d3.descending(accessor(a), accessor(b)));
    const maxValue = d3.max(sorted, accessor) ?? 1;
    const x = d3.scaleLinear()
      .domain(metric === 'share' ? [0, 55] : [0, maxValue * 1.05])
      .range([0, innerWidth]);
    const y = d3.scaleBand<string>()
      .domain(sorted.map((city) => city.city))
      .range([0, innerHeight])
      .padding(.26);

    const svg = d3.select(svgRef.current)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('height', height);
    const root = svg.selectAll<SVGGElement, null>('.comparison-root')
      .data([null])
      .join('g')
      .attr('class', 'comparison-root')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const ticks = metric === 'share' ? 6 : compact ? 3 : 5;
    const xAxis = d3.axisTop(x)
      .ticks(ticks)
      .tickSize(-innerHeight)
      .tickFormat((value) => metric === 'share' ? `${value}%` : d3.format('~s')(Number(value)));
    root.selectAll<SVGGElement, null>('.comparison-x-axis')
      .data([null])
      .join('g')
      .attr('class', 'comparison-x-axis chart-axis chart-grid')
      .call(xAxis);

    const yAxis = d3.axisLeft(y).tickSize(0).tickPadding(10);
    root.selectAll<SVGGElement, null>('.comparison-y-axis')
      .data([null])
      .join('g')
      .attr('class', 'comparison-y-axis chart-axis city-axis')
      .call(yAxis)
      .selectAll('text')
      .attr('class', (city) => city === '調布市' ? 'is-chofu-label' : null);

    if (metric === 'share') {
      const medianGroup = root.selectAll<SVGGElement, number>('.median-group')
        .data([shareMedian])
        .join('g')
        .attr('class', 'median-group');
      medianGroup.selectAll('line')
        .data((value) => [value])
        .join('line')
        .attr('x1', (value) => x(value))
        .attr('x2', (value) => x(value))
        .attr('y1', 0)
        .attr('y2', innerHeight);
      medianGroup.selectAll('text')
        .data((value) => [value])
        .join('text')
        .attr('x', (value) => x(value) + 6)
        .attr('y', -18)
        .text((value) => `26市中央値 ${value.toFixed(1)}%`);
    } else {
      root.selectAll('.median-group').remove();
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const transition = d3.transition().duration(reducedMotion ? 0 : 500).ease(d3.easeCubicOut);

    root.selectAll<SVGLineElement, CityDatum>('.city-stem')
      .data(sorted, (city) => city.code)
      .join('line')
      .attr('class', 'city-stem')
      .attr('x1', x(0))
      .attr('y1', (city) => (y(city.city) ?? 0) + y.bandwidth() / 2)
      .attr('y2', (city) => (y(city.city) ?? 0) + y.bandwidth() / 2)
      .transition(transition)
      .attr('x2', (city) => x(accessor(city)));

    root.selectAll<SVGCircleElement, CityDatum>('.city-dot')
      .data(sorted, (city) => city.code)
      .join('circle')
      .attr('class', (city) => [
        'city-dot',
        city.city === '調布市' ? 'is-chofu' : '',
        city.city === activeCityName ? 'is-active' : '',
      ].filter(Boolean).join(' '))
      .attr('r', (city) => city.city === '調布市' ? 7 : city.city === activeCityName ? 6.5 : 4.3)
      .attr('cy', (city) => (y(city.city) ?? 0) + y.bandwidth() / 2)
      .transition(transition)
      .attr('cx', (city) => x(accessor(city)));

    root.selectAll<SVGCircleElement, CityDatum>('.city-hit')
      .data(sorted, (city) => city.code)
      .join('circle')
      .attr('class', 'city-hit')
      .attr('r', 12)
      .attr('cx', (city) => x(accessor(city)))
      .attr('cy', (city) => (y(city.city) ?? 0) + y.bandwidth() / 2)
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (city) => `${city.city}、単独世帯割合${formatShare(city.singleShare)}、単独世帯${formatInteger.format(city.singleHouseholds)}世帯`)
      .on('pointerenter focus', (_, city) => setHoveredCity(city.city))
      .on('pointerleave blur', () => setHoveredCity(null))
      .on('click keydown', (event, city) => {
        if (event.type === 'click' || (event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === ' ') {
          event.preventDefault();
          setSelectedCity(city.city);
        }
      });

    root.selectAll<SVGTextElement, CityDatum>('.city-value-label')
      .data(sorted.filter((city) => city.city === '調布市' || city.city === activeCityName), (city) => city.code)
      .join('text')
      .attr('class', (city) => city.city === '調布市' ? 'city-value-label is-chofu' : 'city-value-label')
      .attr('x', (city) => x(accessor(city)) + 11)
      .attr('y', (city) => (y(city.city) ?? 0) + y.bandwidth() / 2 + 4)
      .text((city) => metric === 'share' ? formatShare(city.singleShare) : formatInteger.format(city.singleHouseholds));
  }, [activeCityName, data, metric, shareMedian, width]);

  const activeValue = active && (metric === 'share'
    ? formatShare(active.singleShare)
    : `${formatInteger.format(active.singleHouseholds)}世帯`);
  const activeRank = active && (metric === 'share' ? active.shareRank : active.countRank);
  const gapFromChofu = active && chofu
    ? (metric === 'share'
      ? active.singleShare - chofu.singleShare
      : active.singleHouseholds - chofu.singleHouseholds)
    : 0;

  return (
    <div className="comparison-card">
      <div className="chart-controls">
        <div className="metric-toggle" role="group" aria-label="比較する指標">
          <button type="button" className={metric === 'share' ? 'is-selected' : ''} onClick={() => setMetric('share')}>割合で比較</button>
          <button type="button" className={metric === 'count' ? 'is-selected' : ''} onClick={() => setMetric('count')}>世帯数で比較</button>
        </div>
        <label className="city-select">
          比較相手
          <select value={selectedCity} onChange={(event) => setSelectedCity(event.target.value)}>
            {data.map((city) => <option key={city.code} value={city.city}>{city.city}</option>)}
          </select>
        </label>
      </div>

      <div className="active-city-summary" aria-live="polite">
        <div>
          <span className="summary-kicker">{active?.city ?? '読み込み中'}</span>
          <strong>{activeValue ?? '...'}</strong>
        </div>
        <div>
          <span className="summary-kicker">多摩26市で</span>
          <strong>{activeRank ? `${activeRank}位` : '...'}</strong>
        </div>
        <p>
          {active?.city === '調布市'
            ? metric === 'share'
              ? `中央値より${(chofu!.singleShare - shareMedian).toFixed(1)}ポイント高い`
              : '総数では3位。都市の規模も反映する'
            : `調布市との差 ${metric === 'share' ? `${gapFromChofu >= 0 ? '+' : ''}${gapFromChofu.toFixed(1)}ポイント` : `${gapFromChofu >= 0 ? '+' : ''}${formatInteger.format(gapFromChofu)}世帯`}`}
        </p>
      </div>

      <div ref={containerRef} className="comparison-chart-wrap">
        <svg ref={svgRef} className="comparison-chart" role="img" aria-label="多摩26市の単独世帯を比較するドットプロット" />
      </div>
      <p className="interaction-note">市名を選ぶか、点に触れると正確な値を比較できます。</p>
    </div>
  );
}
