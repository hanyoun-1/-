# 디자인 시스템 (핸드오프용)

이 서비스의 색·글자·모서리·그림자·컴포넌트 규칙을 한 파일로 정리했습니다.
다른 서비스가 **동일한 룩앤필**을 재현할 수 있도록 실제 소스(`src/index.css`, `tailwind.config.js`,
`src/components/*`)에서 값을 그대로 추출했습니다.

- 스택: React + TypeScript + **Tailwind CSS** (색은 CSS 변수 기반, 라이트/다크 자동)
- 다크모드: `<html class="dark">` 토글 방식(`darkMode: 'class'`)

---

## 1) 색상 토큰 (라이트 / 다크)

색은 **CSS 변수**로 정의하고 Tailwind가 참조합니다. 의미 기반 네이밍(semantic).

| 토큰 | 의미 | Light | Dark |
|------|------|-------|------|
| `--bg` | 페이지 배경 | `#f7f8fa` | `#0b0f19` |
| `--surface` | 카드·패널 표면 | `#ffffff` | `#141a26` |
| `--surface-muted` | 옅은 표면(입력·탭 배경) | `#f1f3f5` | `#1c2434` |
| `--border` | 테두리·구분선 | `#e5e7eb` | `#26303f` |
| `--text` | 본문 텍스트 | `#0f172a` | `#e6eaf2` |
| `--text-muted` | 보조 텍스트 | `#64748b` | `#94a3b8` |
| `--primary` | 주요 액션·강조 | `#4f46e5` | `#6366f1` |
| `--primary-soft` | primary 옅은 배경 | `#eef2ff` | `#1e1b4b` |
| `--success` | 성공·긍정 | `#16a34a` | `#22c55e` |
| `--warning` | 경고 | `#f59e0b` | `#f59e0b` |
| `--danger` | 오류·삭제 | `#dc2626` | `#ef4444` |
| `--ai` | AI/보라 강조 | `#7c3aed` | `#a78bfa` |

**사용 규칙(관례)**
- 배경 위계: `bg`(페이지) → `surface`(카드) → `surface-muted`(입력/탭/칩 트랙).
- 강조: 채운 버튼·활성 탭은 `primary` + 흰 글씨. 옅은 강조는 `primary-soft` 배경 + `primary` 글씨.
- 상태색은 보통 **10~25% 알파 배경 + 진한 글씨**로 씀 (예: 경고 배지 `bg-warning/10 text-warning`).
- 투명도 표기(Tailwind): `bg-primary/10`, `text-danger`, `border-primary/40` 등.

### CSS 변수 원본
```css
:root {
  --bg:#f7f8fa; --surface:#ffffff; --surface-muted:#f1f3f5; --border:#e5e7eb;
  --text:#0f172a; --text-muted:#64748b;
  --primary:#4f46e5; --primary-soft:#eef2ff;
  --success:#16a34a; --warning:#f59e0b; --danger:#dc2626; --ai:#7c3aed;
}
.dark {
  --bg:#0b0f19; --surface:#141a26; --surface-muted:#1c2434; --border:#26303f;
  --text:#e6eaf2; --text-muted:#94a3b8;
  --primary:#6366f1; --primary-soft:#1e1b4b;
  --success:#22c55e; --warning:#f59e0b; --danger:#ef4444; --ai:#a78bfa;
}
```

---

## 2) 타이포그래피

- **글꼴**: `Pretendard` → 폴백 `Inter, system-ui, sans-serif`
- 굵기: 400(Regular) · 500(Medium) · 600(SemiBold) · 700(Bold)
- `font-family: 'Pretendard', Inter, system-ui, sans-serif;`
- 안티앨리어싱: `-webkit-font-smoothing: antialiased`

**폰트 받기 / 라이선스**
- 이름: **Pretendard** (한글 최적화 무료 폰트)
- 다운로드(GitHub): <https://github.com/orioncactus/pretendard> → `dist/web/static/woff2/`
  - 필요 파일: `Pretendard-Regular.woff2` · `-Medium.woff2` · `-SemiBold.woff2` · `-Bold.woff2`
- CDN(인터넷 가능 시): `https://cdn.jsdelivr.net/gh/orioncactus/pretendard@latest/dist/web/static/pretendard.css`
- **라이선스: SIL Open Font License 1.1** — 무료, 상업적 사용·임베드·재배포 가능(폰트 자체 유료 판매만 금지).
- 폰트가 없어도 폴백(`Inter, system-ui`)으로 깨지지 않게 표시됨.

**자주 쓰는 크기/굵기(관례)**
| 용도 | Tailwind | 대략 |
|------|----------|------|
| 카드 제목 | `text-base font-semibold` | 16px/600 |
| 섹션 소제목 | `text-sm font-semibold` | 14px/600 |
| 본문 | `text-sm` | 14px |
| 보조/라벨 | `text-xs font-medium text-text-muted` | 12px/500 |
| 숫자 지표(큰 값) | `text-2xl font-bold` | 24px/700 |
| 표 안 숫자 | `tabular-nums` (자릿수 정렬) | — |

---

## 3) 모서리 · 그림자 · 간격

| 토큰 | 값 | 용도 |
|------|-----|------|
| radius `card` | **16px** | 카드/패널 |
| radius `btn` | **10px** | 버튼·입력·드롭다운 |
| radius `chip` | **8px** | 칩·탭 알약 |
| shadow `card` | `0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)` | 카드 부양감 |

- 카드 내부 패딩: `p-6`(24px). 요소 간 세로 간격: `space-y-4`~`space-y-5`.
- 그리드/플렉스 간격: `gap-2`(8) · `gap-3`(12) · `gap-5`(20).

---

## 4) 컴포넌트 레시피

### 버튼 (5종 변형)
공통 베이스:
```
inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2 text-sm font-medium transition-all
```
| variant | 클래스 |
|---------|--------|
| **primary** | `bg-primary text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed` |
| **secondary** | `bg-surface border border-border text-text hover:bg-surface-muted disabled:opacity-40` |
| **ghost** | `text-text-muted hover:text-text hover:bg-surface-muted disabled:opacity-40` |
| **danger** | `bg-danger text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed` |
| **success** | `bg-success/15 text-success hover:bg-success/25` |
- 로딩: 왼쪽에 회전 스피너(`h-4 w-4 animate-spin`) + 자동 비활성(`aria-busy`).

### 카드
```
rounded-card border border-border bg-surface p-6 shadow-card
```
- 헤더: `mb-4 flex items-start justify-between gap-4` → 좌측 제목(`text-base font-semibold`)+소제목(`text-sm text-text-muted mt-1`), 우측 슬롯(배지 등).

### 탭 / 세그먼트 (알약형)
- 트랙: `inline-flex flex-wrap gap-1 rounded-btn border border-border bg-surface-muted p-1`
- 항목: `rounded-chip px-4 py-1.5 text-sm font-medium transition-all`
  - 활성: `bg-primary text-white shadow-sm`
  - 비활성: `text-text-muted hover:text-text`
  - 비활성화: `cursor-not-allowed opacity-40`

### 입력 / 드롭다운
```
rounded-btn border border-border bg-surface px-3 py-2 text-sm text-text
focus:border-primary focus:outline-none
```

### 체크박스 칩(선택 토글)
- 선택: `border-primary bg-primary-soft text-primary`
- 비선택: `border-border bg-surface text-text hover:bg-surface-muted`
- 체크 표시: 작은 사각형 안 `✓`, 선택 시 `border-primary bg-primary text-white`.

### 배지(상태/보조 라벨)
```
rounded-chip px-2 py-0.5 text-xs
```
- 서버/AI 강조 예: `bg-ai/10 text-ai` · 중립: `bg-surface-muted text-text-muted`.

### 경고/오류 메시지
- 경고 박스: `rounded-btn bg-warning/10 px-3 py-2 text-sm text-warning`
- 오류 텍스트: `text-sm text-danger` (앞에 `⚠`)
- 성공 텍스트: `text-sm text-success` (앞에 `✓`)

---

## 5) 재현 방법 (다른 서비스에서)

**A. Tailwind 사용 시** — 아래 config extend를 그대로 복사 + 위 CSS 변수 정의.
```js
// tailwind.config.js
export default {
  darkMode: 'class',
  theme: { extend: {
    colors: {
      bg:'var(--bg)', surface:'var(--surface)', 'surface-muted':'var(--surface-muted)',
      border:'var(--border)', text:'var(--text)', 'text-muted':'var(--text-muted)',
      primary:'var(--primary)', 'primary-soft':'var(--primary-soft)',
      success:'var(--success)', warning:'var(--warning)', danger:'var(--danger)', ai:'var(--ai)',
    },
    borderRadius: { card:'16px', btn:'10px', chip:'8px' },
    boxShadow: { card:'0 1px 2px rgba(0,0,0,.04), 0 8px 24px rgba(0,0,0,.06)' },
    fontFamily: { sans:['Pretendard','Inter','system-ui','sans-serif'] },
  }},
};
```

**B. Tailwind 미사용 시** — 위 CSS 변수만 정의하고, 컴포넌트 레시피의 값(radius/shadow/색)을 일반 CSS로 매핑.

**폰트**: Pretendard woff2를 self-host(오프라인) 또는 CDN. 없으면 `system-ui`로 자연 폴백.

---

## 6) 요약 (한눈에)
- **분위기**: 밝은 회색 배경 + 흰 카드, **인디고(primary #4f46e5)** 포인트, 둥근 모서리(카드 16·버튼 10·칩 8), 은은한 카드 그림자.
- **글꼴**: Pretendard(한글 최적), 400~700.
- **패턴**: 표면 위계(bg→surface→surface-muted), 알약형 탭, 상태색은 옅은 배경+진한 글씨.
- **다크모드**: 같은 토큰을 어두운 팔레트로 스왑(구조 동일).
