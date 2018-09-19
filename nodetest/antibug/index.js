const uuid = require('uuid').v4
const _ = require('lodash')
//const { DOMAIN } = require('../config')

class Directive {
  constructor({namespace, name, payload}) {
    this.header = {
      messageId: uuid(),
      namespace: namespace,
      name: name,
    }
    this.payload = payload
  }
}


function audioDirective() {
  return new Directive({
    namespace: 'AudioPlayer',
    name: 'Play',
    payload: {
      audioItem: {
        audioItemId: uuid(),
        stream: {
          beginAtInMilliseconds: 0,
          playType: "NONE",
          token: uuid(),
          url: `http://static.naver.net/clova/service/native_extensions/sound_serise/rainning_sound.mp3`,
          urlPlayable: true
        },
        type: "custom",
      },
      playBehavior: "REPLACE_ALL",
      source: {
        logoUrl: `http://static.naver.net/clova/service/native_extensions/sound_serise/img_sound_rain_108.png`,
        name: "소리 시리즈"
      }
    }
  })
}


class CEKRequest {
  constructor (httpReq) {
    this.request = httpReq.body.request
    this.context = httpReq.body.context
    this.session = httpReq.body.session
    console.log(`CEK Request: ${JSON.stringify(this.context)}, ${JSON.stringify(this.session)}`)
  }

  do(cekResponse) {
    switch (this.request.type) {
      case 'LaunchRequest':
        return this.launchRequest(cekResponse)
      case 'IntentRequest':
        return this.intentRequest(cekResponse)
      case 'SessionEndedRequest':
        return this.sessionEndedRequest(cekResponse)
    }
  }

  launchRequest(cekResponse) {
    console.log('launchRequest');
    cekResponse.setSimpleSpeechText(
      `안녕하세요. 벌레헐떡은 집안에서 발견되는 해충 예방 정보와 피해관리 방법을 알려줘요. 
      정보를 얻고자하는 해충을 불러주세요. 해충은 모기, 진드기, 개미, 거미, 벼룩, 빈대, 바퀴벌레, 쌀벌레, 초파리가 있어요.`);
    cekResponse.setMultiturn();
  }

  intentRequest(cekResponse) {
    const bugNameList = [
      '모기',
      '진드기',
      '개미',
      '거미',
      '벼룩',
      '빈대',
      '바퀴벌레',
      '쌀벌레',
      '초파리'
    ];
    const repelMessages = [
      // 모기
      [
        '에탄올과 잘말린 계피를 8대 2 비율로 섞으면 천연 모기퇴치제가 되요.',
        '하수구나 창문에 토마토 즙을 놓아봐요.',
        '유칼립투스 오일을 물에 섞어 공기 중에 뿌려봐요.'
      ],
      // 진드기
      [
        '계피를 소주와 2:8 비율로 섞어 2주동안 숙성시킨 후 사용해보세요.',
        '티트리 오일과 에탄올을 섞어 분무기에 담아 뿌려보세요.',
        '소독용 에탄올과 구강청정제, 그리고 소금을 7:2:1 비율로 섞어 사용해보세요.'
      ],
      // 개미
      [
        '붕산과 설탕을 1:1로 섞어 호일이나 종이접시 위에 올려 개미가 지나가는 곳에 두어보세요.',
        '사과 식초와 물을 1:1로 섞어 개미가 모이는 곳에 뿌려보세요.',
        '계피가루를 개미가 들어오는 곳에 뿌려보세요.'
      ],
      // 거미
      [
        '귤껍질을 거미가 들어올 법한 곳에 놔두거나 문질러보세요.',
        '베이킹 소다를 거미가 들어올 법한 곳에 뿌려보세요.',
        '소금물을 거미가 있는 곳에 뿌려보세요.'
      ],
      // 벼룩
      [
        '로즈마리 잎을 물에 끓여 체에 거른 후 집안에 뿌려보세요.',
        '소금을 벼룩이 머물 수 있는 섬유가구에 뿌려 문질러보세요.',
        '비눗물을 집안에 벼룩이 발견되는 곳 주변 바닥에 놔둬보세요.'
      ],
      // 빈대
      [
        '가루세제와 소독용 에탄올, 그리고 물을 2:2:6 비율로 섞어 빈대가 발견되는 곳에 수시로 뿌려주세요.',
        '옷과 이불을 고온에서 세탁하고 햇빛으로 소독해보세요.',
        '규조토를 빈대가 발견되는 주변 바닥에 뿌려보세요.'
      ],
      // 바퀴벌레
      [
        '붕산과 삶은 계란 노른자, 백설탕을 1:1:1비율로 섞어 호일이나 종이접시에 올려 바퀴벌레가 지나가는 자리에 나둬봐요.',
        '치약을 바퀴벌레가 지나가는 곳에 짜놓거나 물에 희석해서 뿌려보세요.',
        '은행잎을 말려 망에 넣어 습한 곳에 놔둬보세요.'
      ],
      // 쌀벌레
      [
        '마늘이나 붉은고추를 쌀통에 넣어보세요.',
        '숯을 쌀통에 넣어보세요.',
        '소주를 솜에 적셔 쌀통에 담아 밀봉해보세요.'
      ],
      // 초파리
      [
        '바질 식물을 초파리가 발견되는 곳에서 키워보세요.',
        '시더우드를 초파리가 발견 곳에 놔둬보세요.',
        '과일을 쌀뜨물로 씻어보세요.'
      ]
    ];
    const cureMessages = [
      // 모기
      [
        '물린 부위에 우유를 살짝 발라주면 가려움을 줄여줘요.',
        '반창고나 테이프를 붙혀봐요.',
        '비누로 씻어보세요.'
      ],
      // 진드기
      [
        '치약을 발라보세요.',
        '레몬조각으로 물린부위를 문질러보세요.',
        '물린 부위에 꿀을 발라보세요.'
      ],
      // 개미
      [
        '베이킹소다를 물이나 식초에 섞어 문질러보세요.',
        '숟가락을 따뜻하게 대어 물린부위에 올려보세요.',
        '물파스를 발라보세요.'
      ],
      // 거미
      [
        '물린부위에 아이스팩을 올려두어 냉찜질해보세요.',
        '라벤더 오일을 물린부위에 발라보세요.',
        '알로에 젤을 발라보세요.'
      ],
      // 벼룩
      [
        '차 티백을 식혀 물린부위에 올려보세요.',
        '바질잎을 물을 넣고 을꺠어 발라보세요.',
        '오트밀을 따뜻한 물에 풀어 물린 부위를 담궈보세요.'
      ],
      // 빈대
      [
        '부추를 즙내어 물린부위에 올려보세요.',
        '식초를 물에 희석해 발라보세요.',
        '티트리 오일을 발라보세요.'
      ],
      // 바퀴벌레
      [
      ],
      // 쌀벌레
      [
      ],
      // 초파리
      [
      ]
    ];

    const intent = this.request.intent.name;
    const slots = this.request.intent.slots;

    console.log('intentRequest : ' + intent);
    console.dir(this.request);

    // bug info intent
    if (intent === 'BugInfoIntent') {
      if (slots.bug === undefined) {
        cekResponse.setSimpleSpeechText("죄송해요. 해충의 이름을 다시 말씀해주세요.");
      }
      else {
        const bugName = slots.bug.value;
        const bugIndex = bugNameList.indexOf(bugName);
        const messageIndex = Math.floor(Math.random() * 3);

        if (bugIndex === -1) {
          cekResponse.setSimpleSpeechText("죄송해요." + bugName + "에 대해서는 알지 못합니다.");
        }
        else {
          cekResponse.setSimpleSpeechText(repelMessages[bugIndex][messageIndex]);
          cekResponse.appendSpeechText(bugName + '에게 입은 피해 관리 방법을 알고 싶다면, 벌레헐떡에게 ' + bugName + '에 물렸을 땐 어떡해? 라고 물어보세요. 다른 해충에 대해 알고 싶으면 해충의 이름을 불러주세요.');
        }  
      }

      cekResponse.setMultiturn();
    }
    // bug cure intent
    else if (intent === 'BugCureIntent') {
      if (slots.bug === undefined) {
        cekResponse.setSimpleSpeechText("죄송해요. 해충의 이름을 다시 말씀해주세요.");
      }
      else {
        const bugName = slots.bug.value;
        const bugIndex = bugNameList.indexOf(bugName);
        const messageIndex = Math.floor(Math.random() * 3);

        if (bugIndex < 0 || bugIndex > 5) {
          cekResponse.setSimpleSpeechText("죄송해요." + bugName + "에 대해서는 알지 못합니다.");
        }
        else {
          cekResponse.setSimpleSpeechText(cureMessages[bugIndex][messageIndex]);
          cekResponse.appendSpeechText('다른 해충에 대해 알고 싶으면 해충의 이름을 불러주세요.');
        }  
      }

      cekResponse.setMultiturn();
    }
    // play sound intent
    else if (intent == 'PlaySoundIntent') {
      cekResponse.appendSpeechText("모기 퇴치 초음파를 재생합니다.");
      cekResponse.addDirective(audioDirective());
      cekResponse.setMultiturn();
    }
    // error
    else
    {
      cekResponse.setSimpleSpeechText("죄송해요. 해충의 이름을 말씀해주세요.");
      cekResponse.setMultiturn();
    }
  }

  sessionEndedRequest(cekResponse) {
    console.log('sessionEndedRequest')
    cekResponse.setSimpleSpeechText('벌레헐떡 익스텐션을 종료합니다.')
    cekResponse.clearMultiturn()
  }
}

class CEKResponse {
  constructor () {
    console.log('CEKResponse constructor')
    this.response = {
      directives: [],
      shouldEndSession: true,
      outputSpeech: {},
      card: {},
    }
    this.version = '0.1.0'
    this.sessionAttributes = {}
  }

  setMultiturn(sessionAttributes) {
    this.response.shouldEndSession = false
    this.sessionAttributes = _.assign(this.sessionAttributes, sessionAttributes)
  }

  clearMultiturn() {
    this.response.shouldEndSession = true
    this.sessionAttributes = {}
  }

  addDirective(directive) {
    this.response.directives.push(directive);
  }

  setSimpleSpeechText(outputText) {
    this.response.outputSpeech = {
      type: 'SimpleSpeech',
      values: {
          type: 'PlainText',
          lang: 'ko',
          value: outputText,
      },
    }
  }

  appendSpeechText(outputText) {
    const outputSpeech = this.response.outputSpeech
    if (outputSpeech.type != 'SpeechList') {
      outputSpeech.type = 'SpeechList'
      outputSpeech.values = []
    }
    if (typeof(outputText) == 'string') {
      outputSpeech.values.push({
        type: 'PlainText',
        lang: 'ko',
        value: outputText,
      })
    } else {
      outputSpeech.values.push(outputText)
    }
  }
}

const clovaReq = function (httpReq, httpRes, next) {
  cekResponse = new CEKResponse()
  cekRequest = new CEKRequest(httpReq)
  cekRequest.do(cekResponse)
  console.log(`CEKResponse: ${JSON.stringify(cekResponse)}`)
  return httpRes.send(cekResponse)
};

module.exports = clovaReq;