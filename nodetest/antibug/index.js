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
          url: `https://files.cloud.naver.com/.fileLink/Zmw%2FBSfaygy%2FspUzJq9eyXGyJ3CwcyLJomejGpcWjnLrsIy3Q9QM9aMlOa0Aw4hDlIW1YEYRgI3EBmGE44U75QI%3D/BGM.mp3?authtoken=IP8rQlvaDuY1J7ARb4nCBwI%3D`,
          urlPlayable: true
        },
        type: "custom",
      },
      playBehavior: "REPLACE_ALL"
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
    console.log('launchRequest')
    cekResponse.setSimpleSpeechText('안녕하세요. 벌레헐떡 입니다. 해충의 이름을 말씀해주세요.')
    // cekResponse.setMultiturn({
    //   intent: 'BugInfoIntent',
    // })
  }

  intentRequest(cekResponse) {
    const intent = this.request.intent.name;
    const slots = this.request.intent.slots;

    console.log('intentRequest : ' + intent);
    console.dir(this.request);

    // bug info intent
    if (intent === 'BugInfoIntent') {
      let bugName = null;
      if (slots.bug != undefined) {
        const bugSlot = slots.bug;
        console.log('BugSlot:' + bugSlot);
        bugName = bugSlot.value;
      }
      
      if (bugName === null) {
        console.log('Bug is null!!');
        
        cekResponse.setSimpleSpeechText("죄송해요. 해충의 이름을 다시 말씀해주세요.");
        cekResponse.setMultiturn({
          intent: 'BugInfoIntent',
        });
      }
      else {
        console.log('Bug: ' + bugName);

        if (bugName === '모기')
          cekResponse.setSimpleSpeechText(`유칼립투스 오일을 물에 섞어 공기 중에 뿌리면 천연 모기 퇴치제가 되요.`);
        else if (bugName === '초파리')
          cekResponse.setSimpleSpeechText(`하수구나 창문에 토마토 즙을 놓아봐요.`);
        else if (bugName === '바퀴벌레')
          cekResponse.setSimpleSpeechText(`에탄올과 잘말린 계피를 8대 2 비율로 섞으면 천연 모기퇴치제가 되요.`);
        else if (bugName === '개미')
          cekResponse.setSimpleSpeechText(`물린 부위에 우유를 살짝 발라주면 가려움을 줄여줘요.`);
        else
          cekResponse.setSimpleSpeechText("죄송해요." + bugName + "에 대해서는 알지 못합니다.");
      }
    }
    // play sound intent
    else if (intent == 'PlaySoundIntent') {
      cekResponse.appendSpeechText("모기 퇴치 초음파를 재생합니다.");
      cekResponse.addDirective(audioDirective());
    }
    // error
    else
    {
      cekResponse.setSimpleSpeechText("죄송해요. 해충의 이름을 말씀해주세요.");
    }

    if (this.session.new == false) {
      cekResponse.setMultiturn()
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