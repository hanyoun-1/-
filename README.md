# 📊 노코딩 EDA · 예측 웹앱

코드 없이 **정형데이터(CSV/Excel)** 를 업로드해 `개요 → 기초통계 → 전처리 → 시각화 → (병합) → 예측 → 리포트`까지
한 화면에서 분석하고 **PDF 리포트**로 정리하는 React 웹앱입니다.

- **프론트(React) + 백엔드(FastAPI) 세트로 동작합니다.**
  - **전처리·통계·시각화·리포트**는 브라우저에서 처리 — 데이터가 화면을 벗어나지 않습니다.
  - **모델 학습·예측**은 백엔드에서 수행하며, **머신러닝 및 딥러닝 라이브러리**를 활용해 구현됩니다.
- **자체 계정·권한** — 로그인, 조직·그룹·사용자 관리, 감사 로그(백엔드 DB).
- 새로고침해도 작업 내용 유지(IndexedDB + persist).

> 예측 분석을 쓰려면 백엔드가 떠 있어야 합니다. 설정은 `public/config.json` 의 `API_BASE_URL` 하나뿐입니다
> (같은 오리진이면 `""`). 예전의 `COMPUTE_MODE`(browser/hybrid/server) 설정은 제거됐습니다 — 학습은 항상 백엔드에서 수행합니다.

## 처음 실행하기 (클론 → 첫 로그인)

> DB(계정 포함)는 저장소에 포함되지 않습니다(`.gitignore`). 새로 클론하면 **사용자가 0명**이라,
> 아래 4번에서 **최초 관리자 계정을 직접 만들어야** 로그인할 수 있습니다. 순서대로 따라가세요.

**요구 사항:** Node **18+**, Python **3.12–3.13**(3.14는 핀 고정 패키지의 휠이 없어 `pip install` 이 실패하니 피하세요).

```bash
# 1) 클론 + 프론트 의존성
git clone <repo-url> && cd <repo>
npm install

# 2) 백엔드 의존성 (예측 분석에 필요)
cd backend
# ⚠ 먼저 `python3 --version` 으로 3.12–3.13 인지 확인하세요. 3.14 등이면 pip install 이 휠 없이
#    소스 빌드로 빠져 실패합니다 → 3.12/3.13 을 설치해 그 인터프리터로 venv 를 만드세요.
python3.13 -m venv .venv && source .venv/bin/activate   # python3.13 이 없으면 python3.12 등 3.12–3.13
pip install -r requirements.txt          # torch·catboost 등 대용량 — 아래 '플랫폼별 주의' 참고

# 3) DB 마이그레이션 (빈 DB에 테이블 생성)
alembic upgrade head

# 4) ★ 최초 관리자 계정 생성 (이게 없으면 로그인할 수 없습니다)
python scripts/create_admin.py           # 이메일·비밀번호를 대화형으로 입력(getpass)
#   자동화(선택): ADMIN_EMAIL=you@example.com ADMIN_PASSWORD='...' python scripts/create_admin.py
#   이미 사용자가 있는 DB에 추가하려면 --force, 첫 로그인 강제변경을 끄려면 --no-force-change

# 5) 백엔드 실행
uvicorn app.main:app --reload --port 8000   # http://localhost:8000
```

```bash
# 6) 프론트에 백엔드 주소 알려주기 (로컬은 5273 ↔ 8000 = '다른 오리진'이라 반드시 필요)
#    저장소 루트의 public/config.json 에서:  "API_BASE_URL": "http://localhost:8000"
#    (대안: 루트에 .env.development.local 파일을 만들고  VITE_API_BASE_URL=http://127.0.0.1:8000)

# 7) 프론트 실행 (저장소 루트에서)
npm run dev            # http://localhost:5273

# 8) 4)에서 만든 이메일/비밀번호로 로그인
#    기본은 '첫 로그인 시 비밀번호 변경'이 켜져 있어, 로그인 직후 새 비밀번호를 정하게 됩니다.
```

기타 프론트 스크립트: `npm run build`(타입체크 tsc + 프로덕션 빌드 `dist/`), `npm run preview`(빌드 미리보기).

> **포트가 바뀌면(충돌 등) 양쪽을 맞추세요.** 8000·5273 이 이미 쓰이면 다른 포트로 실행하게 되는데, 특히 프론트 포트가
> 바뀌면(예: 5273 점유 시 vite 가 5274 로 자동 전환) 백엔드 CORS 기본 허용(5273)에 없어 **브라우저 로그인이 CORS 로 차단**됩니다.
> 이때는 백엔드를 `ALLOWED_ORIGINS=http://localhost:5274 uvicorn app.main:app --port 8010` 처럼 **실제 프론트 오리진**으로 띄우고,
> `public/config.json` 의 `API_BASE_URL` 을 **실제 백엔드 주소**(예: `http://localhost:8010`)로 맞추세요.

> ⚠ **`alembic upgrade head`는 백엔드 실행 전에 반드시** 돌리세요. 최초 설치는 물론, 마이그레이션이 추가된
> 버전(예: 자동 튜닝의 `tuning_jobs` 테이블)을 새로 받은 뒤에도 다시 실행해야 합니다. 빼먹으면 학습 요청 시
> `no such table: tuning_jobs` 같은 **500 에러**가 납니다. 순서: **pip install → alembic upgrade head → uvicorn**.

### 환경변수

백엔드는 `backend/.env`(pydantic-settings 자동 로드) 또는 셸 환경변수로 설정합니다. 템플릿은 **`backend/.env.example`** 참고
(실제 값을 넣은 `backend/.env` 는 커밋하지 마세요).

| 변수 | 기본값 / 없을 때 | 설명 |
|---|---|---|
| `JWT_SECRET` | 개발용 임시값으로 동작 + 기동 시 경고 | 토큰 서명 키. **운영 배포 전 강한 랜덤값으로 교체 필수** (`python -c "import secrets; print(secrets.token_urlsafe(48))"`) |
| `DATABASE_URL` | `sqlite:///backend/data/app.db` | DB 위치. 로컬은 보통 비워 둡니다. |
| `APP_ENV` | `dev` | `test`면 검증 모드(실 app.db 사용 차단, 임시 DB 강제). |
| `ALLOWED_ORIGINS` | `http://localhost:5273,http://127.0.0.1:5273` | CORS 허용 오리진(콤마 구분). 배포 시 실제 프론트 오리진 지정. |

프론트 설정은 `public/config.json` 의 `API_BASE_URL`(빈 값 `""` = 같은 오리진) 하나뿐입니다.

### 플랫폼별 주의 (백엔드 의존성)

- **xgboost · lightgbm** — OpenMP 런타임 필요. **macOS:** `brew install libomp` / **Linux:** `libgomp1`(대부분 기본 포함, 폐쇄망은 확인). 없으면 import 시 실패합니다.
- **torch** — **Linux는 CPU 휠을 명시 설치**하세요: `pip install torch==2.13.0 --index-url https://download.pytorch.org/whl/cpu` (기본 설치 시 CUDA 빌드 ~2.5GB를 받습니다). macOS(arm64)는 기본 휠이 이미 CPU/MPS라 그대로 OK.
- **catboost** — 설치 크기가 크고(+~300MB) pandas·matplotlib 등 전이 의존성이 함께 설치됩니다.
- **Python 버전** — 3.12–3.13 권장. 3.14는 일부 과학 패키지 휠이 아직 없을 수 있습니다.

## 단계 흐름 (8단계)

`데이터 업로드 → 데이터 개요 → 기초 통계 → 전처리 → 시각화 → 데이터 병합 → 예측 분석 → 결과 리포트`

상단 **진행 단계 막대**에서 지나온 단계로 언제든 이동할 수 있고, 각 페이지 하단의 이전/다음 버튼으로도 이동합니다.

| 단계 | 내용 |
|------|------|
| **데이터 업로드** | CSV/Excel(.xlsx·.xls) 드래그·선택, 인코딩 검증(UTF-8 권장), 샘플 데이터 체험. 상단 🗑 데이터 삭제로 초기화 |
| **데이터 개요** | 행·열 수 등 기본 구성 + 컬럼 정보(타입·결측치 수/비율·역할) |
| **기초 통계** | 수치형 기초통계량(개수·평균·표준편차·최소·25%·중앙값·75%·최대) + 범주형 요약(컬럼별 빈도/비율) |
| **전처리** *(8종)* | 결측치(행삭제/평균/중앙값/최빈값/지정값)·컬럼편집(이름/타입변환/삭제)·이상치(IQR 제거·직접범위 clip)·인코딩(원핫/라벨)·스케일링(표준화/정규화)·구간화(binning)·수식(formula)·래그(lag). 단계별 적용·되돌리기, 하단 CSV/Excel 내보내기 |
| **시각화** | 히스토그램·박스플롯(그룹별)·산점도·**상관 히트맵**·막대·선·파이 + 대시보드로 모아보기. 히트맵에는 **target 기준 상관계수 상·하위 10개** 표 제공 |
| **데이터 병합** *(선택)* | 다른 파일을 key 컬럼 기준으로 조인해 예측용 데이터 구성(업로드 없이 병합만으로도 시작 가능) |
| **예측 분석** | 회귀/분류 · 알고리즘 선택 · 학습·평가 · **변수 중요도/영향도 · 실제vs예측 · 혼동행렬 · 확률 곡선 · 트리 구조** · 새 값 예측 |
| **결과 리포트** | 개요~예측을 한 페이지로 요약(7개 섹션) + 종합 소견 직접 편집 + **PDF로 저장** |

## 전처리 기능 (8종)

전처리는 **원본을 바꾸지 않고** 순서 있는 단계로 쌓입니다(단계별 되돌리기 가능).

| 기능 | 하는 일 |
|------|---------|
| **결측치** | 빈 값을 행 삭제 또는 평균·중앙값·최빈값·지정값으로 채움 |
| **컬럼 편집** | 컬럼 이름 변경, 타입 변환(astype), 삭제 |
| **이상치** | 튀는 값 제거(IQR 기준) 또는 지정 범위로 자르기(clip) |
| **인코딩** | 글자 범주를 숫자로 변환(원핫/라벨) |
| **스케일링** | 변수 크기를 맞춤(표준화/정규화) |
| **구간화(binning)** | 연속값을 구간(예: 나이대)으로 묶어 라벨 부여 |
| **수식(formula)** | 컬럼 간 사칙연산으로 새 컬럼 생성(안전 파서) |
| **래그(lag)** | 시간순 정렬 후 **N시점 전 값**을 새 컬럼으로 생성(시계열 피처). 그룹(패널) 컬럼 지정 시 그룹별로 나눠 계산 |

### 실무 데이터 대응

실제 CSV에 흔한 "지저분한" 값을 살리기 위한 기능들입니다(모두 전처리 단계에 포함).

- **숫자 추출** — 타입 변환(int/float) 시 옵션으로, `"1회"→1`·`"1,234"→1234`·`"50%"→50`처럼
  **문자·기호가 섞인 값에서 선행 숫자만** 뽑아냅니다. (끄면 기존 변환과 100% 동일 — 하위호환)
- **날짜 형식 지정(DMY/MDY)** — `05/06/2018`처럼 **일·월 순서가 모호한 날짜**를,
  변환 시 `일-월-년(DMY)`/`월-일-년(MDY)` 중에서 골라 올바르게 해석합니다(자동 감지가 애매하면 사용자 지정).
- **시각 보존** — 날짜형(datetime)으로 변환할 때 컬럼에 **시각(HH:MM:SS)이 있으면 자동으로 함께 보존**합니다
  (`columnHasTime` 감지 → `YYYY-MM-DD HH:MM:SS`). 시각이 없으면 날짜만(`YYYY-MM-DD`).
- **래그(lag)** — 시계열 데이터에서 "과거 시점의 값"을 변수로 씁니다. 정렬 기준 컬럼으로 시간순 정렬한 뒤
  N시점 전 값을 가져오며, 가장 이른 시점 행은 참조할 과거가 없어 결측이 됩니다(결측치 단계에서 처리).
  여러 개체가 섞인 **패널 데이터는 그룹 컬럼을 지정**해 개체별로 나눠 계산할 수 있습니다(그룹 경계를 넘는 값 참조 방지).

## 예측 분석 기능

학습·예측은 모두 백엔드에서 수행합니다.

| | 모델 |
|---|---|
| **회귀 (13종)** | 선형회귀 · Ridge · Lasso · ElasticNet · KNN · SVR · 랜덤 포레스트 · XGBoost · LightGBM · CatBoost · MLP(신경망) · LSTM(시계열 전용) · Transformer(표 데이터) |
| **분류 (9종)** | 로지스틱 회귀 · KNN · SVM(SVC) · 결정 트리 · 랜덤 포레스트 · XGBoost · LightGBM · CatBoost · MLP(신경망) |

- **하이퍼파라미터 튜닝** — 모델을 고르면 조정 가능한 설정이 자동으로 나타납니다(슬라이더·드롭다운).
  각 설정은 **서비스 추천 기본값으로 미리 채워진 상태**로 시작하며, 그대로 학습하거나 사용자가 직접 조절할 수 있습니다
  (조절하지 않으면 추천값으로 학습). 명세·기본값은 백엔드가 단일 원천으로 제공(`GET /models/hyperparams`)하고,
  프론트는 그대로 렌더 + 서버가 값을 재검증합니다.
- **자동 최적화(Optuna)** — 지원 모델(랜덤 포레스트·XGBoost·LightGBM·CatBoost·MLP·SVR·SVC·LSTM·Transformer)은
  "자동 최적화" 토글로 켜면 **5-fold 교차검증**으로 최적 설정을 탐색합니다. 모델별 시간 상한(빠른 모델 60초 / 느린 모델 180초 / 딥러닝 300초)과
  시행 횟수 안에서 돌고, **찾은 값이 기본값보다 나쁘면 기본값을 유지**합니다(나빠지지 않음 보장). 무거운 모델은 일부 표본으로 탐색하되
  **최종 학습은 전체 데이터**로 합니다. 학습은 백그라운드 작업으로 돌아 진행률을 폴링하며(`GET /models/train/status/{id}`), 도중 취소할 수 있습니다.
- **딥러닝 모델 특성** — **LSTM**은 시계열 전용이라 **시간 순서 기준 컬럼을 지정**해야 하며 그 순서로 정렬해 학습합니다(순서 없는 데이터에는 부적합).
  **Transformer**는 표(tabular) 데이터용이라 시간 컬럼 없이 일반 데이터에 씁니다. 두 모델은 학습 전 예상 시간을 추정해
  **1회 학습이 120초를 넘을 설정은 미리 차단**합니다(과도한 자원 사용 방지).
- **표준화(스케일링)** — 거리·규제 기반 모델(KNN·SVM·선형 규제·MLP)은 체크박스로 켜고 끕니다.
  학습 분할 이후에 적용되므로 데이터 누수가 없습니다(`Pipeline(StandardScaler, 모델)`).
- **결과 시각화**
  - 지표: 회귀 R²·MAE·RMSE / 분류 정확도·정밀도·재현율·F1·AUC
  - **변수 중요도**(트리·부스팅) / **회귀계수·표준화 계수**(선형·로지스틱) 막대
    — KNN·SVM·MLP처럼 계수·중요도가 없는 모델은 이 섹션이 생략됩니다.
  - 실제값 vs 예측값 산점도(회귀), 혼동 행렬(분류)
  - **예측 확률 곡선**(이진 분류)
  - **🌳 트리 구조** — 학습 데이터로 만든 얕은 결정 트리를 실제 변수·예측값으로 표시(트리 계열)
- **새 값으로 예측** — 변수값을 입력하면 서버에 보관된 모델(`model_id`)로 즉시 예측
- 성능: 트리 학습은 최대 20,000행 표본으로 진행하고, 초과 시 안내 문구를 표시합니다

## 아키텍처

핵심은 **단일 데이터 소스 `activeDataset`** 입니다.

```
원본 dataset(불변) ──(전처리 스텝 적용)──▶ activeDataset ──▶ 모든 화면이 읽음
  src/store/useDatasetStore.ts          useActiveDataset()
```

- **원본은 절대 변경하지 않음.** 전처리는 `steps: PreprocessStep[]`(순서 있는 변형 스택)으로 쌓이고,
  `activeDataset = profileDataset(applySteps(원본, steps))` 로 매번 파생됩니다.
- 화면에서 데이터를 읽을 때는 항상 `useActiveDataset()` 를 사용하세요.

### 디렉터리

```
src/
  store/
    useDatasetStore.ts   원본·activeDataset·전처리 스텝·병합·리포트 상태 (persist + IndexedDB)
    useStepStore.ts      8단계 정의/이동 (STEPS 배열만 고치면 단계 추가/변경)
    useThemeStore.ts     다크모드
  hooks/
    useActiveDataset.ts  모든 화면의 데이터 진입점
    useBusy.ts           무거운 작업용 스피너 상태
  lib/
    parseFile.ts         업로드 파싱·인코딩 감지·검증
    profile.ts           데이터 프로파일링(타입추론·통계·예측후보)
    dataQuality.ts       결측치 판별 등 품질 유틸
    preprocess.ts        전처리 엔진(PreprocessStep 적용) ★ 전처리 추가 시 여기
    models.ts            예측 결과 타입(RegResult·ClsResult 등). 학습 로직은 백엔드에 있음
    compute/             백엔드 학습·예측 호출 어댑터(regression·classification·api·hyperparams)
    merge.ts             예측 전용 key 조인
    charts.ts            차트 데이터 가공·상관계수·Smart Labeling
    cleanData.ts         CSV/XLSX 내보내기
    insights.ts          룰 기반 해석 문구
    report.ts            리포트 데이터 구성 + 인쇄(PDF)
    idb.ts               IndexedDB 저장/복원
  features/
    upload/ overview/ statistics/ preprocess/ visualize/ merge/ predict/ report/   단계별 화면
  components/            공용 UI(Button·Card·KpiCard·SegmentedControl·DecisionTreeConcept 등)
  shell/                 AppShell·Topbar·ProgressStepper·DeleteDataButton·ThemeToggle
  types.ts               전역 타입(PreprocessStep·Dataset 등)

backend/app/
  hyperparams.py         하이퍼파라미터 명세 + 추정기 팩토리 ★ 모델 추가 시 여기
  models_reg.py          회귀 학습(분할·지표·중요도·설명 트리)
  models_cls.py          분류 학습
  routers/models.py      POST /models/train · /models/{id}/predict · GET /models/hyperparams
  routers/               auth·users·organizations·groups·audit (계정·권한)
```

### 자주 하는 변경

- **전처리 종류 추가**: `types.ts`의 `PreprocessStep`에 케이스 추가 → `lib/preprocess.ts`의 적용/로그 구현 → `features/preprocess/PreprocessPage.tsx`에 탭/폼 추가.
- **모델 추가**: `backend/app/hyperparams.py` 에 명세 1개(`HYPERPARAM_SPECS`) + `_ESTIMATORS` 매핑 1줄 →
  `backend/app/routers/models.py` 의 화이트리스트에 algo 추가 → 프론트는 `lib/models.ts` 의 `RegAlgo`/`ClsAlgo` 확장 +
  `PredictPage.tsx` 의 드롭다운·라벨 맵에 항목 추가. **하이퍼파라미터 폼은 명세만 있으면 자동 렌더**됩니다.
- **차트 추가**: `lib/charts.ts`에 데이터 함수 → `features/visualize/VisualizePage.tsx`에 차트 컴포넌트.
- **단계 추가/이름변경**: `store/useStepStore.ts`의 `STEPS` + `types.ts`의 `StepId` + `App.tsx` 렌더 분기.

## 설계 메모

- 전처리 실행 취소 = **마지막 단계 순차 취소(undo)** + 원본 전체 되돌리기.
- 파일 병합은 **예측 전용** — 다른 화면에는 영향을 주지 않습니다.
- 예측 입력 변수는 **수치형만** 사용합니다(범주형은 전처리 > 인코딩에서 변환).
- 모델 학습은 **항상 백엔드**에서 수행합니다. 예전에는 브라우저에서도 학습할 수 있었지만(`COMPUTE_MODE`),
  브라우저 구현이 없는 모델이 대부분이고 하이퍼파라미터가 반영되지 않아 로컬 학습 경로를 제거했습니다.
- 학습·평가 재현성: train/test 분할과 모델 시드가 서버에 고정되어 있어, 같은 데이터·같은 설정이면 항상 같은 결과가 나옵니다.

## 기술 스택

**프론트** React 18 · TypeScript · Vite · Zustand(상태) · Recharts(차트) · Tailwind CSS · papaparse/xlsx(파일 파싱)

**백엔드** FastAPI · scikit-learn · XGBoost · LightGBM · CatBoost · PyTorch(LSTM·Transformer) · Optuna(자동 최적화) · SQLAlchemy + Alembic · JWT 인증
