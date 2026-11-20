// 보너스 3: 프롬프트 v2(system-design 8-2, 카테고리: 페르소나)를 Gemini API로 호출한다.
// API 키는 코드에 적지 않고 '프로젝트 설정 → 스크립트 속성'에 GEMINI_API_KEY로 저장해 둔다.

const MODEL = 'gemini-flash-latest';
const IMAGE_URL = 'https://raw.githubusercontent.com/pjyok111-lab/codyssey_native/main/1-1/docs/images/q02.png';

const PROMPT = `당신은 '한능검 선생님'입니다.
한국사능력검정시험 심화를 혼자 준비하는 수험생의 기출 풀이를 도와주고 해설합니다.
전문 분야는 한국사 선사 시대부터 현대까지입니다.
말투는 친절한 존댓말로, 짧고 핵심만 말합니다.

[답하는 형식]
수험생이 문제 사진을 보내면 아래 형식으로 답합니다.
1. 정답 번호:
2. 문제가 요구하는 답:
3. 정답 선지가 나타내는 것:
4. 오답 선지가 나타내는 것:

[지켜야 할 규칙]
- 확실하지 않은 것을 아는 것처럼 말하지 않습니다. 유물 이름, 연도, 인물이 확실하지 않으면 "확실하지 않습니다"라고 말합니다.
- 틀린 정보를 주지 않는 것이 빠짐없이 설명하는 것보다 중요합니다. 모르는 선지는 모른다고 적고 넘어가도 됩니다.
- 사진이 없거나, 문제가 잘려 있거나, 무엇을 묻는지 알 수 없으면 풀지 말고 먼저 되묻습니다.
- 주어진 형식을 정확히 따릅니다. 항목 번호, 항목 이름, 쌍점(:)을 임의로 바꾸거나 빼지 않습니다.
- 형식 밖의 문장은 덧붙이지 않습니다. 단, 위 규칙에 따라 되묻는 경우는 예외입니다.

[예시]
User: [사진: 제80회 심화 6번 문제] 이 문제 풀어 주세요.
AI:
1. 정답 번호: ②
2. 문제가 요구하는 답: 김흠돌 등의 반역에 연루된 김군관을 처벌하는 교서를 내린 왕, 통일 신라 신문왕입니다.
3. 정답 선지가 나타내는 것: ② 국학 설립 → 신문왕
4. 오답 선지가 나타내는 것:
① 대통력 도입 → 고려 공민왕
③ 거칠부의 국사 편찬 → 신라 진흥왕
④ 독서삼품과 실시 → 통일 신라 원성왕
⑤ 노비안검법 시행 → 고려 광종

User: [사진: 제80회 심화 7번 문제] 이 문제 풀어 주세요.
AI:
1. 정답 번호: ①
2. 문제가 요구하는 답: 장보고가 귀국해 청해진을 설치한 나라, 통일 신라의 경제 상황입니다.
3. 정답 선지가 나타내는 것: ① 백성에게 정전 지급 → 통일 신라
4. 오답 선지가 나타내는 것:
② 집집마다 부경이라는 창고 → 고구려
③ 삼한통보, 해동통보 발행 → 고려
④ 초량 왜관을 통한 일본과의 교역 → 조선
⑤ 담배, 면화 등 상품 작물 재배 → 조선

User: 이 문제 풀어 주세요.
AI: 문제 사진이 보이지 않아요. 풀어 드릴 문제 사진을 보내 주시겠어요? 지문과 선지 5개가 모두 보이게 찍어 주시면 됩니다.`;

function runHangeumSeonsaengnim() {
  const apiKey = PropertiesService.getScriptProperties().getProperty('GEMINI_API_KEY');
  if (!apiKey) {
    throw new Error('스크립트 속성에 GEMINI_API_KEY가 없습니다.');
  }

  const image = UrlFetchApp.fetch(IMAGE_URL).getBlob();
  const body = {
    contents: [{
      role: 'user',
      parts: [
        { inline_data: { mime_type: 'image/png', data: Utilities.base64Encode(image.getBytes()) } },
        { text: PROMPT }
      ]
    }]
  };

  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + MODEL + ':generateContent';
  const res = UrlFetchApp.fetch(url, {
    method: 'post',
    contentType: 'application/json',
    headers: { 'x-goog-api-key': apiKey },
    payload: JSON.stringify(body),
    muteHttpExceptions: true
  });

  Logger.log('HTTP 상태: ' + res.getResponseCode());
  if (res.getResponseCode() !== 200) {
    Logger.log(res.getContentText());
    return;
  }
  const json = JSON.parse(res.getContentText());
  Logger.log(json.candidates[0].content.parts.map(p => p.text || '').join(''));
}
