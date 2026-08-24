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
          <p className="eyebrow">CHOFU / HOUSEHOLD COMPOSITION</p>
          <p className="hero-question">調布市は本当に「家族で暮らす郊外の街」なのか？</p>
          <h1>
            家族で暮らす郊外の街と見られる調布市だが、<br />
            2020年には<span>ほぼ2世帯に1世帯</span>が<span className="claim-tail">一人暮らしである。</span>
          </h1>
          <div className="purpose-statement">
            <strong>問いの目的：</strong>
            <p>調布市を「家族世帯が中心の郊外住宅地」と何となく捉えるのではなく、実際の世帯構成とその変化を知ることで、現在の調布市に暮らす人々の姿を捉え直す。</p>
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
            <h2>調布市の単独世帯率は、<span>東京都26市の中でも高い。</span></h2>
          </div>
          <p>
            2020年の国勢調査で東京都の26市を比べると、調布市の単独世帯率47.5%は5位だった。
            26市の中央値41.5%を6.0ポイント上回り、一人暮らしが調布市の世帯構成の大きな特徴であることがわかる。
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
            <h2>一人暮らしは増え、<span>「夫婦と子ども」の世帯は減ってきた。</span></h2>
          </div>
          <p>
            1995年から2020年に、単独世帯は41.0%から47.5%へ6.5ポイント上昇した。
            一方、「夫婦と子ども」の世帯は29.9%から24.1%へ5.8ポイント低下した。
          </p>
        </div>
        <TimeSeries />
      </section>

      <section className="conclusion-section">
        <p className="section-kicker">結論</p>
        <h2>
          調布市は、<br />
          <span>「家族で暮らす郊外の街」だけでは捉えきれない。</span>
        </h2>
        <p>
          2020年には一般世帯の47.5%が単独世帯で、その割合は東京都26市中5位だった。
          さらに1995年以降、単独世帯が増える一方で「夫婦と子ども」の世帯は減っている。
          つまり、一人暮らしは例外的な存在ではなく、現在の調布市を形づくる主要な暮らし方の一つである。
          ただし、47.5%は世帯の割合であり、住民の47.5%という意味ではない。
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
