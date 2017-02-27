[![Go to Gunnebo](logo.png)](http://gunnebo.com)

# node-red-contrib-cameo
Node-RED node that composes input for [node-red-contrib-artnet](https://github.com/gunnebo-ab/node-red-contrib-artnet) to control [Cameo](http://www.cameolight.com) lights.

[Gunnebo](http://www.gunnebo.com/)  (OMX: GUNN) is a multinational corporation headquartered in Gothenburg, Sweden, specializing in security products, services and solutions mainly in the areas of cash management, entrance security, electronic security and safes & vaults. The Gunnebo Group has operations in 32 countries with approximately 5,500 employees (Jan 2016) and a reported global revenue of €660 million for 2015. Gunnebo has been listed on the Stockholm Stock Exchange in Sweden since 1994 and can be found on the NASDAQ OMX Nordic Exchange Stockholm in the Mid Cap Industrials segment.

## Install

Run the following command in the root directory of your Node-RED install. Usually this is `~/.node-red`
```
npm install node-red-contrib-cameo
```

## Using

You can either setup node via editor or with a payload like the following example:

```
msg.payload = {
    device_type:"par64can_q_8w_bs",
    address_start:1,
    channels:"7channels",
    master_dimmer:0,
    stroboscope:0,
    red:0,
    green:0,
    blue:0,
    white:0,
    color_macro:0
};

```

While configuring node via editor you can specify "-1" as a value for any channel. In that case channel value doesn't change.
