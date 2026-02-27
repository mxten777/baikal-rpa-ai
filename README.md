# BAIKAL RPA AI

**기업 내부 업무 자동화 AI 플랫폼**

> 사내 GPT + 문서 자동 생성 + 업무 자동화(RPA)

---

## 🏗️ 시스템 구성

| 구성요소      | 기술                        | 포트  |
| ------------- | --------------------------- | ----- |
| Frontend      | React + TailwindCSS (Vite)  | 5173  |
| API Server    | FastAPI                     | 8000  |
| Worker        | Celery                      | -     |
| Scheduler     | Celery Beat                 | -     |
| Database      | PostgreSQL 16               | 5432  |
| Queue/Cache   | Redis 7                     | 6379  |
| AI Engine     | OpenAI / Ollama (선택)      | -     |

---

## 📁 프로젝트 구조

```
baikal-rpa-ai/
├── docker-compose.yml
├── .env                          # 환경변수 (복사 후 수정)
├── .env.example
├── db/
│   └── init.sql                  # PostgreSQL 초기화 DDL
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py               # FastAPI 엔트리포인트
│       ├── models.py             # SQLAlchemy 모델
│       ├── core/
│       │   ├── config.py         # 설정 (pydantic-settings)
│       │   ├── db.py             # 비동기 DB 세션
│       │   └── security.py       # JWT + 비밀번호
│       ├── modules/
│       │   ├── auth/             # 로그인 / 회원가입
│       │   ├── ai/               # AI 채팅
│       │   ├── docs/             # 문서 자동 생성
│       │   └── rpa/              # 자동화 CRUD + 실행
│       ├── integrations/
│       │   ├── ai_adapter.py     # OpenAI/Ollama 어댑터
│       │   ├── openai_client.py
│       │   ├── ollama_client.py
│       │   ├── playwright_runner.py  # 웹 스크래핑
│       │   └── excel_processor.py    # 엑셀 처리
│       └── workers/
│           ├── celery_app.py     # Celery 인스턴스
│           ├── tasks.py          # Celery 태스크
│           └── scheduler.py      # Beat 스케줄
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── api.js               # Axios 인스턴스
        ├── components/
        │   └── Layout.jsx       # 사이드바 레이아웃
        └── pages/
            ├── LoginPage.jsx
            ├── DashboardPage.jsx
            ├── AiAssistantPage.jsx
            ├── DocumentsPage.jsx
            ├── DocumentNewPage.jsx
            ├── AutomationsPage.jsx
            ├── AutomationNewPage.jsx
            └── AutomationDetailPage.jsx
```

---

## 🚀 실행 방법

### 1. 환경변수 설정

```bash
cp .env.example .env
```

`.env` 파일을 열고 아래 항목을 수정합니다.

```ini
# AI 프로바이더 선택 (openai 또는 ollama)
AI_PROVIDER=openai

# OpenAI 사용 시
OPENAI_API_KEY=sk-your-real-api-key

# Ollama 사용 시 (로컬 LLM)
# AI_PROVIDER=ollama
# OLLAMA_BASE_URL=http://host.docker.internal:11434
# OLLAMA_MODEL=llama3
```

### 2. Docker Compose 실행

```bash
docker-compose up --build
```

모든 서비스가 시작되면:

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Health Check**: http://localhost:8000/health

### 3. 초기 로그인

최초 실행 시 아래 계정으로 회원가입하거나, API를 통해 사용자를 생성합니다.

**회원가입 (API)**:
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@baikal.ai", "password": "admin1234", "name": "관리자"}'
```

**로그인 (UI)**:
- URL: http://localhost:5173/login
- Email: `admin@baikal.ai`
- Password: `admin1234`

### 4. 서비스 중지

```bash
docker-compose down
```

데이터까지 삭제:
```bash
docker-compose down -v
```

---

## 🔧 API 목록

| Method | Endpoint                          | 설명              |
| ------ | --------------------------------- | ----------------- |
| POST   | `/auth/login`                     | 로그인            |
| POST   | `/auth/register`                  | 회원가입          |
| GET    | `/auth/me`                        | 내 정보 조회      |
| POST   | `/ai/chat`                        | AI 대화           |
| POST   | `/docs/generate`                  | 문서 AI 생성      |
| GET    | `/docs/`                          | 문서 목록         |
| GET    | `/docs/{id}`                      | 문서 상세         |
| DELETE | `/docs/{id}`                      | 문서 삭제         |
| POST   | `/automations/`                   | 자동화 등록       |
| GET    | `/automations/`                   | 자동화 목록       |
| GET    | `/automations/{id}`               | 자동화 상세       |
| DELETE | `/automations/{id}`               | 자동화 삭제       |
| POST   | `/automations/{id}/run`           | 자동화 실행       |
| GET    | `/automations/{id}/runs`          | 실행 기록 목록    |
| GET    | `/automations/{id}/runs/{run_id}` | 실행 기록 상세    |
| POST   | `/automations/upload`             | 파일 업로드       |

---

## 🤖 AI Provider 전환

`.env` 파일에서 `AI_PROVIDER` 값만 변경하면 됩니다.

```ini
# OpenAI 사용
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...

# Ollama 사용 (로컬 LLM)
AI_PROVIDER=ollama
OLLAMA_BASE_URL=http://host.docker.internal:11434
OLLAMA_MODEL=llama3
```

변경 후 API 서버 재시작:
```bash
docker-compose restart api
```

---

## 📋 MVP 핵심 기능

### 1. 로그인 / 인증
- JWT 기반 인증
- 관리자 / 사용자 역할 분리

### 2. AI 업무 도우미
- 실시간 채팅 UI
- 대화 히스토리 유지
- 업무 관련 질문 응답 (공문, 보고서, 이메일 등)

### 3. 문서 자동 생성
- 보고서 / 공문 / 이메일 자동 생성
- AI가 내용을 작성하고 DB에 저장
- 마크다운 미리보기

### 4. 업무 자동화 (RPA)
- **웹 수집**: Playwright로 웹사이트 데이터 수집
- **엑셀 처리**: Pandas로 엑셀 데이터 정리/분석
- **정기 실행**: Cron 표현식으로 스케줄 설정

### 5. 자동화 관리
- 자동화 등록 / 수정 / 삭제
- 수동 실행 + 자동 스케줄 실행
- 실행 로그 / 결과 확인

---

## 🛠️ 개발 모드 (Docker 없이)

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
playwright install chromium

# PostgreSQL, Redis가 로컬에서 실행 중이어야 함
# .env에서 DATABASE_URL을 localhost로 변경

uvicorn app.main:app --reload --port 8000
```

### Worker
```bash
cd backend
celery -A app.workers.celery_app:celery_app worker --loglevel=info
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📄 라이선스

Copyright (c) 2026 BAIKAL AI. All rights reserved.
