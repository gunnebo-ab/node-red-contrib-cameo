module.exports = function (RED) {
    function CameoNode(config) {
        RED.nodes.createNode(this, config);

        const node = this;

        node.data_source = config.data_source;

        this.hexToRgb = function (hex) {
            var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };

        this.findObjectById = function (id, array) {
            return array.find(function (element, index, array) {
                return element.Type.Id == id;
            });
        };


        function getValue(name, c, p) {
            var fromPayload = node.data_source === 'payload' || node.data_source === "configuration_payload";
            return fromPayload ? (p.hasOwnProperty(name) ? p[name] : -1) : (c.hasOwnProperty(name) ? c[name] : -1);
        }

        function removeChannelByIndex(arr, index) {
            for(var i = 0; i < arr.length; i++) {
                if(arr[i].channel === index) {
                    arr.splice(i, 1);
                    return;
                }
            }
        }

        function pushValue(arr, index, v) {
            if(checkValue(v)) {
                removeChannelByIndex(arr, index);
                arr.push({channel:index, value:v});
                return v;
            }
            return -1;
        }

        function checkValue(v) {
            return v > -1 && v < 256;
        }

        function parsePAR64CAN_Q_8W_BS(payload) {
            var buckets = payload.buckets || [];
            var conf = {};
            conf.address_start = node.data_source !== 'payload' ? config.address_start : (payload.address_start || "1");
            conf.channels = node.data_source !== 'payload' ? config.channels : (payload.channels || "7channels");

            var isChannelsFromPayload = node.data_source === 'payload' || node.data_source === "configuration_payload";
            var isChannelsFromConfig = node.data_source === 'configuration';

            var index = conf.address_start;
            if(isChannelsFromPayload || isChannelsFromConfig) {
                conf.master_dimmer = pushValue(buckets, index++, getValue("master_dimmer", config, payload));
                conf.stroboscope = pushValue(buckets, index++, getValue("stroboscope", config, payload));
                conf.red = pushValue(buckets, index++, getValue("red", config, payload));
                conf.green = pushValue(buckets, index++, getValue("green", config, payload));
                conf.blue = pushValue(buckets, index++, getValue("blue", config, payload));
                conf.white = pushValue(buckets, index++, getValue("white", config, payload));
                conf.color_macro = pushValue(buckets, index++, getValue("color_macro", config, payload));
            } else {
                var parameters = payload.ParameterList.Parameter;
                var colorStateObject = node.findObjectById(57, parameters);
                var powerStateObject = node.findObjectById(56, parameters);

                if(powerStateObject) {
                    var powerState = powerStateObject.Value === "on" ? 255 : 0;
                    conf.master_dimmer = pushValue(buckets, index++, powerState);

                    if(colorStateObject){
                        var colorState = colorStateObject.Value;
                        var colors = ["Red", "Green", "Blue", "White"];
                        var colorsIndexes = [2, 3, 4, 5];

                        var colorIndex = colors.indexOf(colorState);
                        if(colorIndex != -1){
                            conf[colors[colorIndex].toLocaleLowerCase()] = pushValue(buckets, conf.address_start + colorsIndexes[colorIndex], 255);
                        }

                        var htoR = node.hexToRgb(colorState);
                        var rgb = /\((\d{1,3})\,(\d{1,3})\,(\d{1,3})\)/.exec(colorState);
                        if(rgb && rgb.length == 4){
                            htoR = {r: rgb[1],g: rgb[2], b: rgb[3]};
                        }

                        if(htoR){
                            conf.red = pushValue(buckets, conf.address_start + 2, htoR.r);
                            conf.green = pushValue(buckets, conf.address_start + 3, htoR.g);
                            conf.blue = pushValue(buckets, conf.address_start + 4, htoR.b);
                        }
                    } else{
                        conf.white = pushValue(buckets, conf.address_start + 5, powerState);
                    }
                }
            }
            return buckets;
        }

        this.on('input', function (msg) {
            var payload = msg.payload;
            var device_type = node.data_source !== 'payload' ? config.device_type : (payload.device_type || "par64can_q_8w_bs");
            var buckets = [];
            switch(device_type) {
                case "par64can_q_8w_bs":
                    buckets = parsePAR64CAN_Q_8W_BS(payload);
                    break;
            }
            node.send({payload: {buckets: buckets}});
        });
    }

    RED.nodes.registerType("cameo out", CameoNode);
};
