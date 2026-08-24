'use client';

import * as d3 from 'd3';
import { useEffect, useMemo, useRef, useState } from 'react';

type HistoryDatum = {
  year: number;
  coupleOnly: number;
  coupleWithChildren: number;
  singleParent: number;
  single: number;
  other: number;
};

const categories: Array<{ key: keyof Omit<HistoryDatum, 'year'>; label: string }> = [
  { key: 'single', label: '単独世帯' },
  { key: 'coupleWithChildren', label: '夫婦と子ども' },
  { key: 'coupleOnly', label: '夫婦のみ' },
  { key: 'singleParent', label: 'ひとり親と子ども' },
  { key: 'other', label: 'その他' },
];

const trendSeries = [
  { key: 'single' as const, label: '単独世帯' },
  { key: 'coupleWithChildren' as const, label: '夫婦と子ども' },
];

export default function TimeSeries() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGSVGElement>(null);
  const waffleRef = useRef<SVGSVGElement>(null);
  const [data, setData] = useState<HistoryDatum[]>([]);
  const [width, setWidth] = useState(720);
  const [selectedYear, setSelectedYear] = useState(2020);
  const [hoveredYear, setHoveredYear] = useState<number | null>(null);

  useEffect(() => {
    const dataUrl = new URL('data/chofu-household-history.csv', document.baseURI).href;

    d3.csv<HistoryDatum>(dataUrl, (row) => ({
      year: Number(row.year),
      coupleOnly: Number(row.coupleOnly),
      coupleWithChildren: Number(row.coupleWithChildren),
      singleParent: Number(row.singleParent),
      single: Number(row.single),
      other: Number(row.other),
    })).then(setData);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.max(320, Math.round(entry.contentRect.width))));
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const activeYear = hoveredYear ?? selectedYear;
  const active = useMemo(() => data.find((datum) => datum.year === activeYear), [activeYear, data]);
  const first = data[0];

  useEffect(() => {
    if (!lineRef.current || !data.length) return;
    const compact = width < 560;
    const height = compact ? 330 : 410;
    const margin = { top: 38, right: compact ? 24 : 54, bottom: 52, left: compact ? 48 : 62 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    const x = d3.scalePoint<number>()
      .domain(data.map((datum) => datum.year))
      .range([0, innerWidth])
      .padding(.15);
    const y = d3.scaleLinear().domain([20, 55]).range([innerHeight, 0]);
    const lineFor = (key: 'single' | 'coupleWithChildren') => d3.line<HistoryDatum>()
      .x((datum) => x(datum.year) ?? 0)
      .y((datum) => y(datum[key]))
      .curve(d3.curveMonotoneX);

    const svg = d3.select(lineRef.current).attr('viewBox', `0 0 ${width} ${height}`);
    const root = svg.selectAll<SVGGElement, null>('.time-root')
      .data([null])
      .join('g')
      .attr('class', 'time-root')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    root.selectAll<SVGGElement, null>('.time-y-axis')
      .data([null])
      .join('g')
      .attr('class', 'time-y-axis chart-axis chart-grid')
      .call(d3.axisLeft(y).ticks(7).tickSize(-innerWidth).tickFormat((value) => `${value}%`));
    root.selectAll<SVGGElement, null>('.time-x-axis')
      .data([null])
      .join('g')
      .attr('class', 'time-x-axis chart-axis')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickSizeOuter(0).tickPadding(10).tickFormat((value) => `${value}`));

    root.selectAll<SVGLineElement, number>('.half-line')
      .data([50])
      .join('line')
      .attr('class', 'half-line')
      .attr('x1', 0)
      .attr('x2', innerWidth)
      .attr('y1', y)
      .attr('y2', y);
    root.selectAll<SVGTextElement, number>('.half-label')
      .data([50])
      .join('text')
      .attr('class', 'half-label')
      .attr('x', innerWidth)
      .attr('y', (value) => y(value) - 9)
      .attr('text-anchor', 'end')
      .text('2世帯に1世帯 = 50%');

    root.selectAll<SVGPathElement, typeof trendSeries[number]>('.time-series-line')
      .data(trendSeries, (series) => series.key)
      .join('path')
      .attr('class', (series) => `time-series-line time-line-${series.key}`)
      .attr('d', (series) => lineFor(series.key)(data));

    const pointData = data.flatMap((datum) => trendSeries.map((series) => ({ datum, series })));
    root.selectAll<SVGCircleElement, typeof pointData[number]>('.time-series-point')
      .data(pointData, ({ datum, series }) => `${series.key}-${datum.year}`)
      .join('circle')
      .attr('class', ({ datum, series }) => `time-series-point time-point-${series.key}${datum.year === activeYear ? ' is-active' : ''}`)
      .attr('cx', ({ datum }) => x(datum.year) ?? 0)
      .attr('cy', ({ datum, series }) => y(datum[series.key]))
      .attr('r', ({ datum }) => datum.year === activeYear ? 6.5 : 4.5);

    root.selectAll<SVGCircleElement, HistoryDatum>('.time-hit')
      .data(data, (datum) => datum.year)
      .join('circle')
      .attr('class', 'time-hit')
      .attr('cx', (datum) => x(datum.year) ?? 0)
      .attr('cy', (datum) => y(datum.single))
      .attr('r', 15)
      .attr('tabindex', 0)
      .attr('role', 'button')
      .attr('aria-label', (datum) => `${datum.year}年、単独世帯割合${datum.single.toFixed(1)}%`)
      .on('pointerenter focus', (_, datum) => setHoveredYear(datum.year))
      .on('pointerleave blur', () => setHoveredYear(null))
      .on('click keydown', (event, datum) => {
        if (event.type === 'click' || (event as KeyboardEvent).key === 'Enter' || (event as KeyboardEvent).key === ' ') {
          event.preventDefault();
          setSelectedYear(datum.year);
        }
      });

    const activeDatum = data.find((datum) => datum.year === activeYear)!;
    const activeLabels = trendSeries.map((series) => ({
      ...series,
      datum: activeDatum,
      value: activeDatum[series.key],
    }));
    root.selectAll<SVGTextElement, typeof activeLabels[number]>('.time-value')
      .data(activeLabels, (series) => series.key)
      .join('text')
      .attr('class', (series) => `time-value time-value-${series.key}`)
      .attr('x', ({ datum }) => x(datum.year) ?? 0)
      .attr('y', ({ value, key }) => y(value) + (key === 'single' ? -16 : 21))
      .attr('text-anchor', activeDatum.year === 2020 ? 'end' : activeDatum.year === 1995 ? 'start' : 'middle')
      .text(({ label, value }) => `${label} ${value.toFixed(1)}%`);
  }, [activeYear, data, width]);

  useEffect(() => {
    if (!waffleRef.current || !active) return;
    const svg = d3.select(waffleRef.current);
    const roundedShare = Math.round(active.single);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    svg.selectAll<SVGRectElement, number>('rect')
      .data(d3.range(100), (datum) => datum)
      .join('rect')
      .attr('x', (datum) => (datum % 10) * 23)
      .attr('y', (datum) => Math.floor(datum / 10) * 23)
      .attr('width', 16)
      .attr('height', 16)
      .attr('rx', 4)
      .transition()
      .duration(reducedMotion ? 0 : 350)
      .attr('class', (datum) => datum < roundedShare ? 'waffle-cell is-single' : 'waffle-cell');
  }, [active]);

  return (
    <div className="time-layout">
      <div className="time-chart-card">
        <div className="time-series-legend" aria-hidden="true">
          <span><i className="legend-single" />単独世帯</span>
          <span><i className="legend-coupleWithChildren" />夫婦と子ども</span>
        </div>
        <div ref={containerRef} className="time-chart-wrap">
          <svg ref={lineRef} className="time-chart" role="img" aria-label="1995年から2020年までの調布市の単独世帯と夫婦と子どもの世帯割合を示す折れ線グラフ" />
        </div>
        <p className="time-chart-caption">25年間で、単独世帯は6.5ポイント増え、「夫婦と子ども」の世帯は5.8ポイント減った。</p>
        <div className="year-selector" role="group" aria-label="表示する国勢調査年">
          {data.map((datum) => (
            <button key={datum.year} type="button" className={selectedYear === datum.year ? 'is-selected' : ''} onClick={() => setSelectedYear(datum.year)}>
              {datum.year}
            </button>
          ))}
        </div>
      </div>

      <aside className="year-detail" aria-live="polite">
        <span className="detail-year">{active?.year ?? '...'}年</span>
        <div className="detail-stat"><strong>{active?.single.toFixed(1) ?? '...'}</strong><span>%</span></div>
        <p>単独世帯の割合</p>
        <svg ref={waffleRef} className="detail-waffle" viewBox="0 0 223 223" role="img" aria-label={`${active?.year ?? ''}年の単独世帯割合を100世帯に見立てた図`} />
        <p className="change-note">
          {active && first ? `1995年から ${active.single - first.single >= 0 ? '+' : ''}${(active.single - first.single).toFixed(1)}ポイント` : '読み込み中'}
        </p>
        <div className="composition" aria-label={`${active?.year ?? ''}年の世帯類型別構成`}>
          <div className="composition-bar" aria-hidden="true">
            {active && categories.map(({ key }) => <span key={key} className={`segment segment-${key}`} style={{ width: `${active[key]}%` }} />)}
          </div>
          <dl>
            {active && categories.map(({ key, label }) => (
              <div key={key}>
                <dt><i className={`legend-${key}`} />{label}</dt>
                <dd>{active[key].toFixed(1)}%</dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>
    </div>
  );
}
