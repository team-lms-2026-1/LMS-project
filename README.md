# Team LMS Project

팀 LMS 프로젝트의 **Git / 브랜치 / PR / 협업 규칙**을 정리한 문서입니다.  
모든 팀원은 아래 규칙을 기준으로 개발을 진행합니다.

---

## 1. Main 브랜치 규칙

- ❌ `main` 브랜치에 **직접 push 금지**
- ✅ 모든 변경은 **feature 브랜치 → Pull Request → Merge**
- ✅ **CI 통과 필수**
- ✅ PR 본문은 **PR Template**에 맞춰 작성

---

## 2. 기본 작업 흐름 (공통)

모든 git 명령어는 루트에서!!!

### 2-1. 작업 시작 전 (최신 코드 받기)

```bash
git checkout main
git pull origin main
```

---

### 2-2. 작업 브랜치 생성

브랜치명 예시:
- `feature/backend-health`
- `feature/frontend-login-ui`
- `fix/backend-docker`
- `chore/ci-update`
- `docs/community`

```bash
git checkout -b feature/your-task-name
```

---

### 2-3. 작업 후 변경사항 확인

```bash
git status
git diff
```

---

### 2-4. add / commit

```bash
git add -A
git commit -m "feat: add health endpoint"
```

#### 커밋 메시지 규칙
- `feat:` 기능 추가
- `fix:` 버그 수정
- `chore:` 설정/빌드/잡일
- `docs:` 문서
- `ci:` CI/CD 관련

---

### 2-5. 원격 저장소로 push

처음 push할 때:
```bash
git push -u origin feature/your-task-name
```

---

## 3. Pull Request(PR) 작성 규칙

- base 브랜치: `main`
- PR 생성 시 **PR Template 자동 적용**
- PR 본문은 반드시 템플릿에 맞춰 작성

필수 작성 항목:
- Summary
- Scope (Backend / Frontend / Infra)
- How to Test
- Related Issue ( close# 로 꼭 이슈닫기 )

---

## 4. PR 머지 전 행동 요령 (필수)

### 4-1. main 브랜치 최신화

작업 중 main에 변경이 들어갔을 경우:

```bash
git checkout main
git pull origin main
git checkout feature/your-task-name
git merge main
```

충돌 발생 시 해결 후 커밋 & push

---

### 4-2. 로컬 테스트

- **Backend**: 실행 후 `/api/health` 확인
- **Frontend**: 로컬 실행 및 주요 화면 확인

---

### 4-3. CI 확인

PR 페이지에서 아래 항목이 **성공(✅)** 상태여야 함:
- `CI / backend-gradle-build`

실패 시:
- 로그 확인
- 수정 후 다시 push

---

### 4-4. 리뷰 & 승인

- 단순 코멘트 ❌
- **Approve(승인) 1개 이상 필요**
- 승인자는 **Write 권한 이상**이어야 함

---

## 5. PR 머지 후 정리

```bashz
git checkout main
git pull origin main
git branch -d feature/your-task-name
```

원격 브랜치 삭제(선택):

```bash
git push origin --delete feature/your-task-name
```

---

## 6. Backend 팀 사용 가이드

루트에서!!

### 6-1. 로컬 실행 (Docker Compose)

```bash
docker compose -f infra/docker-compose.local.yml up --build
```

중지:
```bash
docker compose -f infra/docker-compose.local.yml down
```

---

### 6-2. Health Check ( No valid )

```
GET http://localhost:8080/health
```

---

### 6-3. 백엔드 커밋 범위

- `backend/**`
- `infra/**` (필요 시)
- `.github/**` (CI 변경 시)

---

## 7. Frontend 팀 사용 가이드

### 7-1. 로컬 실행 (예: Next.js)

```bash
cd frontend
npm install
npm run dev
```

---

### 7-2. 프론트엔드 커밋 범위

- `frontend/**`
- `.env.example` (환경변수 변경 시)
- `README.md` (실행 방법 변경 시)

---

## 8. 참고 파일

- PR Template: `.github/pull_request_template.md`
- CI Workflow: `.github/workflows/ci.yml`
- Local Infra: `infra/docker-compose.local.yml`

