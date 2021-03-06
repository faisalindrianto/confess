/* eslint-disable */

function preferCodecHelper(sdp, codec, info, ignore) {
  let preferCodecNumber = ''

  if (codec === 'vp8') {
    if (!info.vp8LineNumber) {
      return sdp
    }
    preferCodecNumber = info.vp8LineNumber
  }

  if (codec === 'vp9') {
    if (!info.vp9LineNumber) {
      return sdp
    }
    preferCodecNumber = info.vp9LineNumber
  }

  if (codec === 'h264') {
    if (!info.h264LineNumber) {
      return sdp
    }

    preferCodecNumber = info.h264LineNumber
  }

  let newLine = `${info.videoCodecNumbersOriginal.split('SAVPF')[0]}SAVPF `

  let newOrder = [preferCodecNumber]

  if (ignore) {
    newOrder = []
  }

  info.videoCodecNumbers.forEach(codecNumber => {
    if (codecNumber === preferCodecNumber) return
    newOrder.push(codecNumber)
  })

  newLine += newOrder.join(' ')

  sdp = sdp.replace(info.videoCodecNumbersOriginal, newLine)

  return sdp
}

function splitLines(sdp) {
  const info = {}
  sdp.split('\n').forEach(line => {
    if (line.indexOf('m=video') === 0) {
      info.videoCodecNumbers = []
      line.split('SAVPF')[1].split(' ').forEach(codecNumber => {
        codecNumber = codecNumber.trim()
        if (!codecNumber || !codecNumber.length) return
        info.videoCodecNumbers.push(codecNumber)
        info.videoCodecNumbersOriginal = line
      })
    }

    if (line.indexOf('VP8/90000') !== -1 && !info.vp8LineNumber) {
      info.vp8LineNumber = line.replace('a=rtpmap:', '').split(' ')[0]
    }

    if (line.indexOf('VP9/90000') !== -1 && !info.vp9LineNumber) {
      info.vp9LineNumber = line.replace('a=rtpmap:', '').split(' ')[0]
    }

    if (line.indexOf('H264/90000') !== -1 && !info.h264LineNumber) {
      info.h264LineNumber = line.replace('a=rtpmap:', '').split(' ')[0]
    }
  })

  return info
}

export default function preferCodec(sdp, codecName) {
  const info = splitLines(sdp)

  if (!info.videoCodecNumbers) {
    return sdp
  }

  if (codecName === 'vp8' && info.vp8LineNumber === info.videoCodecNumbers[0]) {
    return sdp
  }

  if (codecName === 'vp9' && info.vp9LineNumber === info.videoCodecNumbers[0]) {
    return sdp
  }

  if (codecName === 'h264' && info.h264LineNumber === info.videoCodecNumbers[0]) {
    return sdp
  }

  sdp = preferCodecHelper(sdp, codecName, info)

  return sdp
}
