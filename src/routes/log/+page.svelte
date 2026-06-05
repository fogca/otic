<svelte:head>
  <title>Log / TAKUMIISOBE</title>
  <link rel="stylesheet" href="/css/base.css" />
</svelte:head>

<main class="log-page">
  <p class="page-title">Log</p>

  <div class="entries">
    <div class="container">

      <article class="entry">
        <div class="h7">Thoughts / 26.04.04</div>
        <h2 class="mt-20" lang="en">Considering Vulgarity</h2>
        <h3 lang="ja">猥雑さを考える</h3>
        <p lang="ja">TAKUMIISOBE.COMは、意匠設計をはじめプロダクトエンジニアリングや3DCGI・ビジュアライゼーションといった視覚領域を専門に活動するスタジオです。ライフスタイルからテクノロジーやファイナンシャルインダストリーなど分野横断的にコラボレーションを行い、基本思想を見いだし、視覚可能なモノへと変換します。</p>
      </article>

      <hr />

      <article class="entry">
        <div class="h7">Review / 26.03.28</div>
        <h2 class="mt-20" lang="en">On Material and Memory</h2>
        <h3 lang="ja">素材と記憶について</h3>
        <p lang="ja">私たちの原動力は斬新かつセンセーショナルな体験を想像し、未だ見ぬ価値を社会に実装することです。蜘蛛巣の張ったサイフォンを眺めながら。</p>
      </article>

    </div>
  </div>
</main>

<style>
  .log-page {
    background-color: var(--color-bg-log);
    min-height: 100vh;
    position: relative;
  }

  .log-page * {color: var(--color-white);}

  .page-title {
    font-family: var(--font-en);
    font-size: var(--fs-page-title);
    line-height: var(--lh-page-title);
    position: absolute;
    left: 64px;
    top: 436px;
  }

  .entries {
    position: absolute;
    left: 703px;
    top: 227px;
    width: 356px;
    display: flex;
    flex-direction: column;
    gap: 91px;
  }

  .container {
    display: flex;
    flex-direction: column;
  }

  .entry {
    display: flex;
    flex-direction: column;
  }

  .h7 {
    font-family: var(--font-en);
    font-size: var(--fs-label);
    line-height: var(--lh-label);
  
  }

  h2.mt-20 {
    font-family: var(--font-en);
    font-size: var(--fs-title-en);
    line-height: var(--lh-title-en);
    font-weight: 400;
    margin-top: 20px;

  }

  h3 {
    font-family: var(--font-ja);
    font-size: var(--fs-title-ja);
    line-height: var(--lh-title-ja);
    font-weight: 400;
    margin-top: 8px;
  }

  p {
    font-family: var(--font-ja);
    font-size: var(--fs-body-desktop);
    line-height: var(--lh-body);
    margin-top: 15px;
  }

  hr {
    border: none;
    border-top: 0.5px solid var(--color-white);
    width: 60px;
    margin: 90px 0;
    align-self: flex-start;
  }

  /* Mobile */
  @media (max-width: 768px) {
    .page-title {
      display: none;
    }

    .entries {
      position: static;
      width: 100%;
      padding: 166px 21px 0;
      gap: 60px;
    }

    p {
      font-size: var(--fs-body-mobile);
    }
  }
</style>
