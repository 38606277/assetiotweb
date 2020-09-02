/*
  图片压缩方法 *传入的文件大小已经比设定的参数小的时候，会直接返回原文件
  第一个入参  file
  第二个入参  可以直接是一个数字，表示图片大小，默认100kb (100000 byte)
            也可以是一个小数，表示图片压缩比例，例如 .8 表示 #分辨率# 压缩为原来的0.8倍
            也可以是一个对象，可以包含size, width, height, fileType，其中：
                size可以是图片大小，也可以是压缩比例
                width是压缩后的图片宽度，默认自动按比例缩小
                height是压缩后的图片高度，默认自动按比例缩小
                fileType是压缩后的图片类型，可以是png或者jpg，不填则与原文件相同
                qualityArgument是压缩后的图片质量，针对jpg图片，默认0.8中画质。0.6为低画质，0.9～1为高画质

*/
export function imageCompress(file, obj = {}) {
    return new Promise((resolve, reject) => {
        let {
            size,
            width,
            height,
            fileType,
            qualityArgument
        } = obj

        if (typeof obj == 'number') {
            size = obj
        }

        if (file && file.size) {
            //不需要压缩
            if (size && file.size <= size) {
                resolve(file)
                return
            }
        } else {
            reject({
                msg: '文件参数错误，请确认是否传入了文件'
            })
            return
        }

        size = size || 100000

        if (!/(jpg|jpeg|png)$/.test(file.type)) {
            reject({
                msg: '文件格式不是jpg或者png，请确认文件格式'
            })
            return
        }
        fileType = fileType || file.type
        switch (fileType) {
            case 'jpg':
            case 'jpeg':
            case 'image/jpeg':
                fileType = 'image/jpeg'
                break
            case 'png':
            case 'image/png':
                fileType = 'image/png'
                break
            default:
                reject({
                    msg: '不支持的文件格式'
                })
                return
        }
        //canvas检测。canvas用来压缩图片
        let canvas = document.createElement('canvas')
        if (!canvas || !canvas.getContext) {
            reject({
                msg: '浏览器不支持canvas'
            })
            return
        }
        let context = canvas.getContext('2d')

        //FileReader检测。FileReader用来转base64
        if (!window.FileReader) {
            reject({
                msg: '浏览器不支持FileReader'
            })
            return
        }
        let reader = new FileReader(),
            img = new Image()
        reader.readAsDataURL(file)

        reader.onload = function (e) {
            // e.target.result就是图片base64
            img.src = e.target.result
        }
        img.onload = function () {
            let originWidth = img.width,
                originHeight = img.height
            if (width && height) {
                if (width > originWidth && height > originHeight) {
                    //原始分辨率比设定的分辨率小，不需要压缩
                    resolve(file)
                    return
                }
            } else if (width) {
                if (width > originWidth) {
                    //原始分辨率比设定的分辨率小，不需要压缩
                    resolve(file)
                    return
                }
                height = originHeight * width / originWidth
            } else if (height) {
                if (height > originHeight) {
                    //原始分辨率比设定的分辨率小，不需要压缩
                    resolve(file)
                    return
                }
                width = originWidth * height / originHeight
            } else {
                let ratio = (size > 0 && size < 1) ? size : 0.9

                width = (originWidth * ratio) | 0
                height = (originHeight * ratio) | 0
            }
            canvas.width = width
            canvas.height = height
            context.drawImage(img, 0, 0, width, height)
            canvas.toBlob(function (blob) {
                if (size && size > 1) {

                    if (blob.size <= size) {
                        resolve(blob)
                    } else {
                        imageCompress(blob, obj).then((newBlob) => {
                            resolve(newBlob)
                        })
                    }

                } else {
                    resolve(blob)
                }
            }, fileType, qualityArgument || .8)

        }
    })
}