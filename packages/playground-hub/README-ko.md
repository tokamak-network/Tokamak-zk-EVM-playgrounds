# Tokamak-zk-evm-playground 사용 안내서

안녕하세요! 이 문서는 **Tokamak-zk-evm-playground**를 여러분의 컴퓨터에 설치하고 실행하는 방법을 안내해 드립니다. 조금 생소한 과정이 있을 수 있지만, 차근차근 따라 하시면 어렵지 않아요! 😊

## 1. 이 프로그램은 무엇인가요?

- Tokamak-zk-evm-playground는 어려운 전문 지식 없이도 Tokamak zk-EVM이 어떻게 작동하는지 그 전체적인 흐름을 쉽고 재미있게 이해하고 체험해 볼 수 있도록 도와주는 프로그램입니다.
- 마치 복잡한 기계의 내부를 직접 들여다보고 만져보는 것처럼, Tokamak zk-EVM의 주요 과정을 단계별로 시뮬레이션해볼 수 있습니다.

## 2. 시작하기 전에: "도커(Docker)"가 필요해요! 🐳

- **도커가 뭔가요?**
  - 도커는 우리 프로그램(Tokamak-zk-EVM)이 어떤 컴퓨터에서든 복잡한 설정 없이 똑같이 잘 돌아갈 수 있도록 도와주는 마법 상자 같은 거예요. 이 상자 덕분에 필요한 모든 준비물을 한 번에 갖추고, "내 컴퓨터에서는 안 되는데?" 하는 문제를 크게 줄일 수 있답니다.
- **왜 필요한가요?**
  - Tokamak-zk-EVM은 여러 가지 개발 도구와 특별한 실행 환경을 필요로 해요. 도커는 이 모든 것을 깔끔하게 담아서 제공하기 때문에, 여러분은 복잡한 설치 과정 대신 프로그램 사용에만 집중할 수 있습니다.

## 3. 설치 과정 (단계별 안내) 🛠️

### 3.1. 도커(Docker) 설치하기

- **준비물:**
  - 안정적인 인터넷 연결
  - 사용 중인 컴퓨터 운영체제 확인 (예: Windows 10/11, macOS 최신 버전 등 지원하는 OS 명시)
- **설치 방법:**

  1.  **도커 다운로드 페이지 접속:**
      - **Windows 사용자:** [Docker Desktop for Windows 다운로드](https://www.docker.com/products/docker-desktop/) (클릭하시면 다운로드 페이지로 이동합니다)
      - **Mac 사용자 (Intel칩 / Apple Silicon칩 확인 후 다운로드):** [Docker Desktop for Mac 다운로드](https://www.docker.com/products/docker-desktop/) (클릭하시면 다운로드 페이지로 이동합니다)
  2.  **다운로드 및 설치 진행:**
      - 다운로드된 설치 파일(`Docker Desktop Installer.exe` 또는 `Docker.dmg`)을 실행하고, 화면에 나오는 안내에 따라 설치를 진행해주세요.
      - (Windows의 경우, WSL 2 관련 설치나 설정이 필요할 수 있습니다. 화면 안내를 잘 따라주세요.)
      - (특별히 선택해야 하는 옵션이 있다면 여기에 명시. 대부분 기본 설정을 유지하면 됩니다.)
  3.  **설치 확인 (가장 중요! ✨):**

      - 설치가 완료되면 컴퓨터를 재부팅해야 할 수 있습니다.
      - 바탕화면이나 응용 프로그램 목록에서 **Docker Desktop**을 실행해주세요.
      - 컴퓨터 화면 오른쪽 아래 작업 표시줄(Windows)이나 화면 독 메뉴(Mac)에 **고래 모양 아이콘**🐳이 나타나는지 확인해주세요.
        ![Docker 설치 성공 - MacOS](./assets/images/4-1.png)
      - 고래 아이콘을 클릭했을 때 "Docker Desktop is running" (또는 초록색으로 "Running" 표시) 메시지가 보이거나 도커 프로그램 창이 열린다면 성공적으로 실행된 것입니다!
        ![Docker 실행 성공 - MacOS](./assets/images/4-2.png)
        ![Docker 실행 성공 - MacOS](./assets/images/4-3.png)

        - 만약 실행되지 않거나 오류 메시지가 보인다면, 컴퓨터를 다시 한번 재부팅하고 Docker Desktop을 실행해보세요.

### 3.2. Tokamak-zk-evm-playground 다운로드 및 준비하기

- **다운로드:**
  - [최신 버전 다운로드](https://github.com/tokamak-network/Tokamak-zk-EVM-playgrounds/releases/tag/0.0.1-alpha)
  - 다운로드 파일은 보통 압축 파일(`.tar.gz`) 형태일 것입니다.
  - **Mac 사용자 (Apple Silicon):** arm-64 버전을 다운로드하세요. (예: `playground-hub-macOS-arm64-v0.0.1-portable`)
  - **Windows 사용자:** Windows 버전을 다운로드하세요.
- **압축 해제:**
  - 다운로드한 압축 파일을 사용하기 편한 폴더에 풀어주세요. (예: Windows에서는 마우스 오른쪽 클릭 후 "압축 풀기...", Mac에서는 더블 클릭)
- **파일 위치:**
  - 압축을 푼 `Tokamak-zk-evm-playground` 폴더를 사용자가 찾기 쉬운 곳에 두세요. (예: `바탕화면`, `내 문서` 또는 `다운로드` 폴더 등)

## 4. Tokamak-zk-evm-playground 실행하기 🚀

1.  **(가장 중요!) 먼저 Docker Desktop이 실행 중인지 다시 한번 확인해주세요.** (화면에 고래 아이콘🐳이 보이고 "running" 상태여야 합니다!)

- 도커가 설치돼있지않거나 실행하지 않고 Tokamak-zk-evm-playground를 실행한다면 도커를 설치하거나 실행하라고 경고 메세지가 나타나며 다음 단계로 진행되지 않습니다.

2.  이전에 `Tokamak-zk-evm-playground` 압축을 푼 폴더로 이동합니다.
3.  폴더 안에서 다음 실행 파일을 찾아 더블 클릭하여 실행합니다:
    - **Windows:** `(실행 파일 이름.exe)` (예: `tokamak-zk-evm-playground.exe`)
    - **macOS:** `(실행 파일 이름.app)` (예: `tokamak-zk-evm-playground.app`)
4.  프로그램이 시작되면 잠시 기다려주세요.

## 5. 프로그램 사용 방법 (간단 소개) 📖

- (Tokamak-zk-evm-playground가 실행된 후 보이는 첫 화면이나 가장 기본적인 기능에 대해 1~2 문장으로 설명해주세요. 사용자가 처음 무엇을 시도해볼 수 있을지 안내합니다.)
- **예시:**
  - "프로그램이 실행되면 OOO 화면이 나타납니다. 여기서 '새 프로젝트 만들기' 버튼을 클릭하여 시작할 수 있습니다."
  - "왼쪽 메뉴에서 '회로 컴파일'을 선택하고 예제 파일을 불러와 테스트해보세요."
- (더 자세한 사용법이나 각 기능에 대한 설명은 프로그램 내 도움말 메뉴나 별도의 사용자 매뉴얼 링크를 통해 안내할 수 있습니다.)
  - **예시:** `[자세한 사용법 보기](여기에-매뉴얼-링크)`

## 6. 문제가 생겼나요? (간단한 문제 해결) 🤔

- **"도커가 실행되고 있지 않아요." 라는 메시지가 떠요 / 프로그램이 도커를 찾지 못해요.**
  - 가장 먼저 Docker Desktop이 정말 실행 중인지 확인해주세요 (고래 아이콘🐳!).
  - Docker Desktop을 완전히 종료했다가 다시 실행해보세요.
  - 컴퓨터를 재부팅한 후 Docker Desktop을 먼저 실행하고, 그다음에 Tokamak-zk-evm-playground를 실행해보세요.
- **(Tokamak-zk-evm-playground 관련 흔한 오류 1가지와 해결 방법)**
- **(Tokamak-zk-evm-playground 관련 흔한 오류 2가지와 해결 방법)**
- **그래도 해결되지 않는다면?**
  - (문의할 수 있는 GitHub Issues 페이지, 커뮤니티 포럼/디스코드 채널 링크, 이메일 주소 등 도움을 받을 수 있는 창구를 안내해주세요.)
  - **예시:** `[GitHub Issues에 질문 남기기](여기에-GitHub-Issues-링크)`

## 7. (선택 사항) 프로그램 삭제하기 🗑️

- **Tokamak-zk-evm-playground 삭제:**
  - `Tokamak-zk-evm-playground` 프로그램을 종료합니다.
  - 프로그램이 설치된 (또는 압축을 푼) 폴더 전체를 삭제하면 됩니다. (별도의 제거 프로그램은 필요 없어요!)
- **도커(Docker) 삭제 (더 이상 Tokamak-zk-evm-playground나 다른 도커 기반 프로그램을 사용하지 않을 경우):**
  - **Windows:** `설정` > `앱` > `설치된 앱` 목록에서 `Docker Desktop`을 찾아 제거합니다.
  - **Mac:** `응용 프로그램` 폴더에서 `Docker.app`을 휴지통으로 드래그합니다.
  - (도커를 삭제하면 다른 도커 기반 프로그램도 사용할 수 없게 되니 신중하게 결정해주세요!)
  - (자세한 내용은 도커 공식 홈페이지의 삭제 안내를 참고하세요.)
