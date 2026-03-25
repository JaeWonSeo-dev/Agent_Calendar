export default function HomePage() {
  return (
    <main style={{ padding: 24, fontFamily: 'sans-serif', maxWidth: 960, margin: '0 auto' }}>
      <h1>Agent Calendar</h1>
      <p>회원가입 → 첫 로그인 온보딩 → 캘린더 + LLM 챗봇 워크스페이스 흐름을 위한 초기 웹 골격이다.</p>

      <section style={{ marginTop: 24 }}>
        <h2>Flow</h2>
        <ol>
          <li>회원가입 / 로그인</li>
          <li>최초 로그인 시 온보딩</li>
          <li>메인 워크스페이스 진입</li>
          <li>좌측 70% 달력 / 우측 30% 챗봇</li>
        </ol>
      </section>

      <section style={{ marginTop: 24 }}>
        <a href="/onboarding">온보딩 보기</a>
        <span> | </span>
        <a href="/workspace">워크스페이스 보기</a>
      </section>
    </main>
  );
}
