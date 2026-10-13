# 배포 가이드 (SaaS / 설치형)

이 앱은 **빌드 1개로 고객별 환경에 대응**합니다. 계산 위치·백엔드 주소 등은
빌드 후 `config.json` 만 바꾸면 되고, 다시 빌드할 필요가 없습니다.

## 설정 우선순위

| 순위 | 소스 | 시점 | 용도 |
|------|------|------|------|
| 1 (최우선) | **`config.json`** (`dist/config.json`) | **런타임** | 고객별 주입 — 재빌드 불필요 |
| 2 | **`VITE_*` 환경변수** | 빌드타임 | 개발·CI 기본값 |
| 3 | 하드코딩 기본값 | — | 아무것도 없을 때(=browser 모드) |

- 빈 문자열/미설정 값은 "미설정"으로 보고 다음 순위로 넘어갑니다.
- **`config.json` 이 없거나 로드 실패해도** 조용히 폴백 → 기존과 동일하게 동작.

### config.json 필드
```json
{
  "API_BASE_URL": "",       // '' = same-origin(프론트와 같은 오리진의 백엔드)
  "API_TIMEOUT_MS": 30000
}
```
> **백엔드는 필수입니다.** 모델 학습·예측은 항상 백엔드에서 수행합니다.
> 계산 위치 설정(`COMPUTE_MODE`, `SIZE_THRESHOLD_*`)은 제거됐습니다 — 브라우저 학습 경로가 없어졌기 때문입니다.
> (전처리·통계·시각화·리포트는 그대로 브라우저에서 처리되며, 데이터는 백엔드 학습 요청 외에는 전송되지 않습니다.)

---

## 1) 빌드
```bash
npm install
npm run build     # dist/ 생성 (config.json·fonts 포함)
```

## 2) SaaS 배포 (정적 호스팅 + 백엔드)
1. `dist/` 를 정적 호스팅(S3/CloudFront/Netlify 등)에 업로드.
2. `dist/config.json` 을 서비스 환경에 맞게 수정:
   ```json
   { "API_BASE_URL": "https://api.example.com" }
   ```
3. **백엔드**(`backend/`, FastAPI) 배포 후, CORS 오리진을 프론트 도메인으로 제한:
   ```bash
   ALLOWED_ORIGINS="https://app.example.com" uvicorn app.main:app --port 8000
   ```
   (`backend/app/main.py` 가 `ALLOWED_ORIGINS` 콤마구분 환경변수를 읽음)

## 3) 설치형 배포 (고객 내부망 / 폐쇄망)
1. `dist/` 를 고객 서버에 배치(정적 웹서버: nginx 등).
2. 고객이 `dist/config.json` 을 자기 환경에 맞게 수정(재빌드 없음):
   - 백엔드를 같은 오리진에 리버스 프록시로 두면 `"API_BASE_URL": ""`(same-origin).
   - 별도 호스트면 내부 주소 지정: `"API_BASE_URL": "http://10.0.0.5:8000"`.
   - 백엔드는 반드시 함께 배치해야 합니다(예측 분석에 필수).
3. **오프라인(폐쇄망)**: 외부 인터넷 의존이 없어야 함.
   - ✅ CDN 폰트 제거 완료 → **`public/fonts/` 에 Pretendard woff2 를 넣어** 로컬 폰트 사용
     (없어도 system 폰트로 폴백되어 동작. `public/fonts/README.md` 참고).
   - 백엔드 사용 시 Python 의존성을 오프라인 휠로 사전 설치.

---

## 백엔드 CORS
- `backend/app/main.py` 는 `ALLOWED_ORIGINS`(콤마구분 환경변수)로 허용 오리진을 주입받습니다.
  미설정 시 개발 기본값(`http://localhost:5273`). 배포 시 실제 프론트 오리진으로 지정하세요.

## 참고
- `API_BASE_URL` 을 서브경로/다른 포트로 두면 CORS 설정이 필요합니다(same-origin이면 불필요).
- 프론트 서브경로 배포(`vite base`) 시 `index.css` 의 `/fonts/` 경로도 함께 맞추세요.
