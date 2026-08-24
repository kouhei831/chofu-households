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
          <a href="#method">データと設計</a>
        </nav>
        <span className="data-chip">国勢調査 1995-2020</span>
      </header>

      <section className="hero" id="top">
        <div className="hero-copy">
          <p className="eyebrow">東京都調布市 / 常識・偏見から自由になるため</p>
          <h1>
            「家族の街」調布市で、<br />
            いまやほぼ<span>2世帯に1世帯</span>が<br />
            一人暮らしだ。
          </h1>
          <p className="hero-lead">
            郊外の住宅都市というイメージの内側で、世帯のかたちは変わっている。
            2020年の調布市では、一般世帯120,790世帯のうち57,424世帯が単独世帯だった。
          </p>
          <div className="question-card">
            <span>問い</span>
            <p>調布市では、現在どのような世帯が暮らし、その構成はこれまでどう変わったのか？</p>
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
        <span>比較すると、この数字の輪郭が見える</span>
        <i aria-hidden="true" />
      </a>

      <section className="story-section comparison-section" id="compare">
        <div className="section-heading">
          <span className="section-number">01 / 比較</span>
          <div>
            <p className="section-kicker">多摩26市のなかで</p>
            <h2>47.5%は、26市中<span>5番目</span>に高い。</h2>
          </div>
          <p>
            調布市だけを見ても、47.5%が高いのかは判断できない。
            SSDSE-Aの同じ2020年国勢調査データで、東京都の26市を同じものさしにそろえた。
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
          <strong>なぜ「割合」で見るのか</strong>
          <p>世帯数の実数には都市の規模が強く表れる。世帯構成を比べるため、主張には「単独世帯数 ÷ 一般世帯数」の割合を使った。上の切り替えで、その違いを確認できる。</p>
        </div>
      </section>

      <section className="story-section history-section" id="history">
        <div className="section-heading inverse">
          <span className="section-number">02 / 時間</span>
          <div>
            <p className="section-kicker">25年間の変化</p>
            <h2>41.0%から47.5%へ、<span>6回の国勢調査で一度も低下していない。</span></h2>
          </div>
          <p>
            1995年から2020年まで、調布市の単独世帯割合は少しずつ上がった。
            点に触れるか年を選ぶと、その年の構成を100世帯に見立てて確認できる。
          </p>
        </div>
        <TimeSeries />
      </section>

      <section className="conclusion-section">
        <p className="section-kicker">結論</p>
        <h2>
          調布市は「家族だけの街」ではない。<br />
          <span>一人で暮らす世帯も、この街のほぼ半分を形づくっている。</span>
        </h2>
        <p>
          ただし、これは「住民の半数が一人暮らし」という意味ではない。
          分母は人ではなく一般世帯であり、家族世帯には複数の人が暮らす。
          可視化が示すのは、街の人口ではなく、暮らしを営む単位の多様化である。
        </p>
      </section>

      <section className="story-section method-section" id="method">
        <div className="section-heading compact-heading">
          <span className="section-number">03 / 根拠</span>
          <div>
            <p className="section-kicker">データと設計</p>
            <h2>問いから逆算して、データ・図・操作を選んだ。</h2>
          </div>
        </div>

        <div className="method-grid">
          <article>
            <span>DATA 01</span>
            <h3>現在地を比べる</h3>
            <p>SSDSE-A-2026の2020年「一般世帯数」「単独世帯数」から割合を算出。東京都内は市のみを抽出し、区・町・村を除いた26市で比較した。</p>
            <a href="https://www.nstac.go.jp/use/literacy/ssdse/" target="_blank" rel="noreferrer">統計センター SSDSE ↗</a>
          </article>
          <article>
            <span>DATA 02</span>
            <h3>変化をたどる</h3>
            <p>調布市「男女共同参画推進プラン（第5次）」図2-8の国勢調査値を使用。1995-2020年の5年ごとの世帯類型割合を比較した。</p>
            <a href="https://www.city.chofu.lg.jp/documents/4712/tyoufushidanjyosannkakusuisinnpuranndai5zi.pdf" target="_blank" rel="noreferrer">調布市 公式資料 ↗</a>
          </article>
          <article>
            <span>QUALITY</span>
            <h3>欠損・外れ値</h3>
            <p>SSDSEは欠測なし。抽出した26市も全件が数値で、除外は0件。最大値の武蔵野市も実在する地域差として保持した。時系列は6時点すべて掲載値を使用した。</p>
          </article>
        </div>

        <div className="design-decisions">
          <article>
            <span>選択 / 記号</span>
            <h3>位置で量を比べる</h3>
            <p>市は質的、割合・世帯数は量的、年は時間データ。26市は共通軸上の位置で正確に比較できるドットプロット、連続する変化は折れ線を選んだ。</p>
          </article>
          <article>
            <span>代替案</span>
            <h3>地図と棒グラフを見送る</h3>
            <p>地理的位置が問いの中心ではなく面積差も生むため地図は不採用。26本の棒はインク量が多いため、順位と差を軽く見せる点へ置き換えた。時系列の棒も、変化のつながりを優先して不採用とした。</p>
          </article>
          <article>
            <span>構成 / 操作</span>
            <h3>説明型に、必要な探索だけ</h3>
            <p>「現在の驚き → 他市比較 → 過去からの変化 → 結論」の一本道。操作しなくても主張が読め、操作すると26市の正確な値と各年の構成を調べられる。</p>
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
        <span>朝島 康平 / 情報可視化 最終演習</span>
        <a href="#top">ページ先頭へ ↑</a>
      </footer>
    </main>
  );
}
