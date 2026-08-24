'use client';

import * as d3 from 'd3';
import { useEffect, useRef } from 'react';
import CityComparison from './city-comparison';
import TimeSeries from './time-series';

const SINGLE_SHARE = 47.54;

export default function Visualization() {
  const waffleRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(waffleRef.current);
    const cells = d3.range(100);
    const cellSize = 19;
    const gap = 7;
    svg.selectAll<SVGRectElement, number>('rect')
      .data(cells, (datum) => datum)
      .join('rect')
      .attr('x', (datum) => (datum % 10) * (cellSize + gap))
      .attr('y', (datum) => Math.floor(datum / 10) * (cellSize + gap))
      .attr('width', cellSize)
      .attr('height', cellSize)
      .attr('rx', 5)
      .attr('class', (datum) => datum < Math.round(SINGLE_SHARE) ? 'waffle-cell is-single' : 'waffle-cell');
  }, []);

  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="ページ先頭へ">
          <span className="brand-mark" aria-hidden="true">調</span>
          <span>CHOFU / HOUSEHOLDS</span>
        </a>
        <nav className="site-nav" aria-label="ページ内ナビゲーション">
          <a href="#compare">26市比較</a>
          <a href="#history">25年の変化</a>
          <a href="#method">データと出典</a>
        </nav>
        <span className="data-chip">国勢調査 1995-2020</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">東京都調布市 / 2020年国勢調査</p>
          <p className="claim-label">主張</p>
          <h1>
            調布市の単独世帯は<br />
            <span>47.5%</span>
          </h1>
          <p className="hero-lead">
            2020年の調布市では、一般世帯120,790世帯のうち57,424世帯が、
            1人で暮らす単独世帯だった。
          </p>
          <div className="intro-facts">
            <div className="question-card">
              <span>問い</span>
              <p>調布市の単独世帯割合は、東京都26市の中でどの位置にあり、1995年からどう変化したのか？</p>
            </div>
            <div className="question-card purpose-card">
              <span>目的</span>
              <p>他市との比較と25年間の推移から、調布市の世帯構成の特徴を確認する。</p>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="stat-lockup">
            <span className="stat-number">47.5</span>
            <span className="stat-unit">%</span>
          </div>
          <p className="stat-caption">単独世帯の割合 / 2020年</p>
          <svg ref={waffleRef} className="waffle" viewBox="0 0 253 253" role="img" aria-label="100世帯のうち、およそ48世帯が単独世帯であることを示す図" />
          <div className="waffle-legend" aria-hidden="true">
            <span><i className="legend-single" />単独世帯</span>
            <span><i />その他の世帯</span>
          </div>
          <p className="definition-note">単独世帯 = 世帯人員が1人の一般世帯</p>
        </div>
      </section>

      <a className="scroll-cue" href="#compare">
        <span>26市の中で比べる</span>
        <i aria-hidden="true" />
      </a>

      <section className="story-section comparison-section" id="compare">
        <div className="section-heading">
          <span className="section-number">01 / 比較</span>
          <div>
            <p className="section-kicker">東京都26市の比較</p>
            <h2>調布市は、単独世帯割合が<span>5番目</span>に高い。</h2>
          </div>
          <p>
            2020年の26市中央値は41.5%。調布市の47.5%は、中央値を6.0ポイント上回る。
            各市は同じ国勢調査の一般世帯数と単独世帯数で比較した。
          </p>
        </div>
        <div className="finding-strip">
          <div><strong>47.5%</strong><span>調布市</span></div>
          <span className="finding-arrow" aria-hidden="true">−</span>
          <div><strong>41.5%</strong><span>26市中央値</span></div>
          <p><b>+6.0ポイント</b>、中央値を上回る。</p>
        </div>
        <CityComparison />
        <div className="reading-note">
          <strong>割合と実数</strong>
          <p>割合は世帯構成、実数は都市規模の影響を含む。上の切り替えで両方を確認できる。</p>
        </div>
      </section>

      <section className="story-section history-section" id="history">
        <div className="section-heading inverse">
          <span className="section-number">02 / 時間</span>
          <div>
            <p className="section-kicker">25年間の変化</p>
            <h2>1995年の41.0%から、<span>2020年の47.5%へ上昇した。</span></h2>
          </div>
          <p>
            5年ごとの6時点すべてで、前回調査を上回った。
            年を選ぶと、その年の家族類型別構成を確認できる。
          </p>
        </div>
        <TimeSeries />
      </section>

      <section className="conclusion-section">
        <p className="section-kicker">わかったこと</p>
        <h2>
          調布市では、単独世帯が一般世帯の47.5%を占める。<br />
          <span>割合は1995年から2020年までに6.5ポイント上昇した。</span>
        </h2>
        <p>
          この割合の分母は一般世帯であり、人口ではない。
          「住民の47.5%が一人暮らし」という意味ではない点に注意が必要である。
        </p>
      </section>

      <section className="story-section method-section" id="method">
        <div className="section-heading compact-heading">
          <span className="section-number">03 / 根拠</span>
          <div>
            <p className="section-kicker">データと出典</p>
            <h2>使ったデータと計算方法</h2>
          </div>
        </div>

        <div className="method-grid">
          <article>
            <span>DATA 01</span>
            <h3>2020年の26市比較</h3>
            <p>SSDSE-A-2026の2020年「一般世帯数」「単独世帯数」から割合を算出。東京都内は市のみを抽出し、区・町・村を除いた26市で比較した。</p>
            <a href="https://www.nstac.go.jp/use/literacy/ssdse/" target="_blank" rel="noreferrer">統計センター SSDSE ↗</a>
          </article>
          <article>
            <span>DATA 02</span>
            <h3>1995–2020年の推移</h3>
            <p>調布市「男女共同参画推進プラン（第5次）」図2-8の国勢調査値を使用。1995-2020年の5年ごとの世帯類型割合を比較した。</p>
            <a href="https://www.city.chofu.lg.jp/documents/4712/tyoufushidanjyosannkakusuisinnpuranndai5zi.pdf" target="_blank" rel="noreferrer">調布市 公式資料 ↗</a>
          </article>
          <article>
            <span>計算と確認</span>
            <h3>単独世帯割合</h3>
            <p>単独世帯数 ÷ 一般世帯数 × 100で算出。26市の使用項目に欠損はなく、除外や補完は行っていない。</p>
          </article>
        </div>

        <div className="source-box">
          <div>
            <span>出典・取得日</span>
            <p>独立行政法人 統計センター「SSDSE-市区町村（SSDSE-A-2026）」、調布市「調布市男女共同参画推進プラン（第5次）」／取得日 2026年8月24日</p>
          </div>
          <div>
            <span>計算式</span>
            <p>単独世帯割合 = 単独世帯数 ÷ 一般世帯数 × 100。表示は小数第1位、順位計算は丸め前の値を使用。</p>
          </div>
        </div>
      </section>

      <footer>
        <a href="#top">ページ先頭へ ↑</a>
      </footer>
    </main>
  );
}
