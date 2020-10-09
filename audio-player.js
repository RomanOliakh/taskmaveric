/*
 * ID3 (v1/v2) Parser
 * 43081j
 * License: MIT, see LICENSE
 */


!function () {
    var e = function (t) {
        this.type = t || e.OPEN_URI, this.size = null, this.file = null
    };
    if (e.OPEN_FILE = 1, e.OPEN_URI = 2, e.OPEN_LOCAL = 3, "function" == typeof require) var t = require("fs");
    e.prototype.open = function (n, i) {
        this.file = n;
        var r = this;
        switch (this.type) {
            case e.OPEN_LOCAL:
                t.stat(this.file, function (e, n) {
                    if (e) return i(e);
                    r.size = n.size, t.open(r.file, "r", function (e, t) {
                        if (e) return i(e);
                        r.fd = t, i()
                    })
                });
                break;
            case e.OPEN_FILE:
                this.size = this.file.size, i();
                break;
            default:
                this.ajax({uri: this.file, type: "HEAD"}, function (e, t, n) {
                    if (e) return i(e);
                    r.size = parseInt(n.getResponseHeader("Content-Length")), i()
                })
        }
    }, e.prototype.close = function () {
        this.type === e.OPEN_LOCAL && t.close(this.fd)
    }, e.prototype.read = function (t, n, i) {
        "function" == typeof n && (i = n, n = 0), this.type === e.OPEN_LOCAL ? this.readLocal(t, n, i) : this.type === e.OPEN_FILE ? this.readFile(t, n, i) : this.readUri(t, n, i)
    }, e.prototype.readBlob = function (e, t, n, i) {
        "function" == typeof t ? (i = t, t = 0) : "function" == typeof n && (i = n, n = "application/octet-stream"), this.read(e, t, function (e, t) {
            e ? i(e) : i(null, new Blob([t], {type: n}))
        })
    }, e.prototype.readLocal = function (e, n, i) {
        var r = new Buffer(e);
        t.read(this.fd, r, 0, e, n, function (e, t, n) {
            if (e) return i(e);
            for (var r = new ArrayBuffer(n.length), a = new Uint8Array(r), o = 0; o < n.length; o++) a[o] = n[o];
            i(null, r)
        })
    }, e.prototype.ajax = function (e, t) {
        var n = {type: "GET", uri: null, responseType: "text"};
        for (var i in "string" == typeof e && (e = {uri: e}), e) n[i] = e[i];
        var r = new XMLHttpRequest;
        r.onreadystatechange = function () {
            if (4 === r.readyState) return 200 !== r.status && 206 !== r.status ? t("Received non-200/206 response (" + r.status + ")") : void t(null, r.response, r)
        }, r.responseType = n.responseType, r.open(n.type, n.uri, !0), n.range && (n.range = [].concat(n.range), 2 === n.range.length ? r.setRequestHeader("Range", "bytes=" + n.range[0] + "-" + n.range[1]) : r.setRequestHeader("Range", "bytes=" + n.range[0])), r.send()
    }, e.prototype.readUri = function (e, t, n) {
        this.ajax({uri: this.file, type: "GET", responseType: "arraybuffer", range: [t, t + e - 1]}, function (e, t) {
            return e ? n(e) : n(null, t)
        })
    }, e.prototype.readFile = function (e, t, n) {
        var i = this.file.slice(t, t + e), r = new FileReader;
        r.onload = function (e) {
            n(null, e.target.result)
        }, r.onerror = function (e) {
            n("File read failed")
        }, r.readAsArrayBuffer(i)
    }, DataView.prototype.getString = function (e, t, n) {
        t = t || 0, (e = e || this.byteLength - t) < 0 && (e += this.byteLength);
        var i = "";
        if ("undefined" != typeof Buffer) {
            for (var r = [], a = t; a < t + e; a++) r.push(this.getUint8(a));
            return new Buffer(r).toString()
        }
        for (a = t; a < t + e; a++) i += String.fromCharCode(this.getUint8(a));
        return n ? i : decodeURIComponent(encodeURIComponent(i))
    }, DataView.prototype.getStringUtf16 = function (e, t, n) {
        t = t || 0, e = e || this.byteLength - t;
        var i = !1, r = "", a = !1;
        ("undefined" != typeof Buffer && (r = [], a = !0), e < 0 && (e += this.byteLength), n) && (65534 === this.getUint16(t) && (i = !0), t += 2, e -= 2);
        for (var o = t; o < t + e; o += 2) {
            var l = this.getUint16(o, i);
            l >= 0 && l <= 55295 || l >= 57344 && l <= 65535 ? a ? r.push(l) : r += String.fromCharCode(l) : l >= 65536 && l <= 1114111 && (l -= 65536, a ? (r.push(55296 + ((1047552 & l) >> 10)), r.push(56320 + (1023 & l))) : r += String.fromCharCode(55296 + ((1047552 & l) >> 10)) + String.fromCharCode(56320 + (1023 & l)))
        }
        return a ? new Buffer(r).toString() : decodeURIComponent(encodeURIComponent(r))
    }, DataView.prototype.getSynch = function (e) {
        for (var t = 0, n = 2130706432; n;) t >>= 1, t |= e & n, n >>= 8;
        return t
    }, DataView.prototype.getUint8Synch = function (e) {
        return this.getSynch(this.getUint8(e))
    }, DataView.prototype.getUint32Synch = function (e) {
        return this.getSynch(this.getUint32(e))
    }, DataView.prototype.getUint24 = function (e, t) {
        return t ? this.getUint8(e) + (this.getUint8(e + 1) << 8) + (this.getUint8(e + 2) << 16) : this.getUint8(e + 2) + (this.getUint8(e + 1) << 8) + (this.getUint8(e) << 16)
    };
    var n = function (t, i) {
        var r = {type: n.OPEN_URI};
        for (var a in "string" == typeof t ? t = {
            file: t,
            type: n.OPEN_URI
        } : "undefined" != typeof window && window.File && t instanceof window.File && (t = {
            file: t,
            type: n.OPEN_FILE
        }), t) r[a] = t[a];
        if (!r.file) return i("No file was set");
        if (r.type === n.OPEN_FILE) {
            if ("undefined" == typeof window || !window.File || !window.FileReader || "undefined" == typeof ArrayBuffer) return i("Browser does not have support for the File API and/or ArrayBuffers")
        } else if (r.type === n.OPEN_LOCAL && "function" != typeof require) return i("Local paths may not be read within a browser");
        var o = ["Blues", "Classic Rock", "Country", "Dance", "Disco", "Funk", "Grunge", "Hip-Hop", "Jazz", "Metal", "New Age", "Oldies", "Other", "Pop", "R&B", "Rap", "Reggae", "Rock", "Techno", "Industrial", "Alternative", "Ska", "Death Metal", "Pranks", "Soundtrack", "Euro-Techno", "Ambient", "Trip-Hop", "Vocal", "Jazz+Funk", "Fusion", "Trance", "Classical", "Instrumental", "Acid", "House", "Game", "Sound Clip", "Gospel", "Noise", "AlternRock", "Bass", "Soul", "Punk", "Space", "Meditative", "Instrumental Pop", "Instrumental Rock", "Ethnic", "Gothic", "Darkwave", "Techno-Industrial", "Electronic", "Pop-Folk", "Eurodance", "Dream", "Southern Rock", "Comedy", "Cult", "Gangsta Rap", "Top 40", "Christian Rap", "Pop / Funk", "Jungle", "Native American", "Cabaret", "New Wave", "Psychedelic", "Rave", "Showtunes", "Trailer", "Lo-Fi", "Tribal", "Acid Punk", "Acid Jazz", "Polka", "Retro", "Musical", "Rock & Roll", "Hard Rock", "Folk", "Folk-Rock", "National Folk", "Swing", "Fast  Fusion", "Bebob", "Latin", "Revival", "Celtic", "Bluegrass", "Avantgarde", "Gothic Rock", "Progressive Rock", "Psychedelic Rock", "Symphonic Rock", "Slow Rock", "Big Band", "Chorus", "Easy Listening", "Acoustic", "Humour", "Speech", "Chanson", "Opera", "Chamber Music", "Sonata", "Symphony", "Booty Bass", "Primus", "Porn Groove", "Satire", "Slow Jam", "Club", "Tango", "Samba", "Folklore", "Ballad", "Power Ballad", "Rhythmic Soul", "Freestyle", "Duet", "Punk Rock", "Drum Solo", "A Cappella", "Euro-House", "Dance Hall", "Goa", "Drum & Bass", "Club-House", "Hardcore", "Terror", "Indie", "BritPop", "Negerpunk", "Polsk Punk", "Beat", "Christian Gangsta Rap", "Heavy Metal", "Black Metal", "Crossover", "Contemporary Christian", "Christian Rock", "Merengue", "Salsa", "Thrash Metal", "Anime", "JPop", "Synthpop", "Rock/Pop"],
            l = {
                types: {
                    TALB: "album",
                    TBPM: "bpm",
                    TCOM: "composer",
                    TCON: "genre",
                    TCOP: "copyright",
                    TDEN: "encoding-time",
                    TDLY: "playlist-delay",
                    TDOR: "original-release-time",
                    TDRC: "recording-time",
                    TDRL: "release-time",
                    TDTG: "tagging-time",
                    TENC: "encoder",
                    TEXT: "writer",
                    TFLT: "file-type",
                    TIPL: "involved-people",
                    TIT1: "content-group",
                    TIT2: "title",
                    TIT3: "subtitle",
                    TKEY: "initial-key",
                    TLAN: "language",
                    TLEN: "length",
                    TMCL: "credits",
                    TMED: "media-type",
                    TMOO: "mood",
                    TOAL: "original-album",
                    TOFN: "original-filename",
                    TOLY: "original-writer",
                    TOPE: "original-artist",
                    TOWN: "owner",
                    TPE1: "artist",
                    TPE2: "band",
                    TPE3: "conductor",
                    TPE4: "remixer",
                    TPOS: "set-part",
                    TPRO: "produced-notice",
                    TPUB: "publisher",
                    TRCK: "track",
                    TRSN: "radio-name",
                    TRSO: "radio-owner",
                    TSOA: "album-sort",
                    TSOP: "performer-sort",
                    TSOT: "title-sort",
                    TSRC: "isrc",
                    TSSE: "encoder-settings",
                    TSST: "set-subtitle",
                    TAL: "album",
                    TBP: "bpm",
                    TCM: "composer",
                    TCO: "genre",
                    TCR: "copyright",
                    TDY: "playlist-delay",
                    TEN: "encoder",
                    TFT: "file-type",
                    TKE: "initial-key",
                    TLA: "language",
                    TLE: "length",
                    TMT: "media-type",
                    TOA: "original-artist",
                    TOF: "original-filename",
                    TOL: "original-writer",
                    TOT: "original-album",
                    TP1: "artist",
                    TP2: "band",
                    TP3: "conductor",
                    TP4: "remixer",
                    TPA: "set-part",
                    TPB: "publisher",
                    TRC: "isrc",
                    TRK: "track",
                    TSS: "encoder-settings",
                    TT1: "content-group",
                    TT2: "title",
                    TT3: "subtitle",
                    TXT: "writer",
                    WCOM: "url-commercial",
                    WCOP: "url-legal",
                    WOAF: "url-file",
                    WOAR: "url-artist",
                    WOAS: "url-source",
                    WORS: "url-radio",
                    WPAY: "url-payment",
                    WPUB: "url-publisher",
                    WAF: "url-file",
                    WAR: "url-artist",
                    WAS: "url-source",
                    WCM: "url-commercial",
                    WCP: "url-copyright",
                    WPB: "url-publisher",
                    COMM: "comments",
                    APIC: "image",
                    PIC: "image"
                },
                imageTypes: ["other", "file-icon", "icon", "cover-front", "cover-back", "leaflet", "media", "artist-lead", "artist", "conductor", "band", "composer", "writer", "location", "during-recording", "during-performance", "screen", "fish", "illustration", "logo-band", "logo-publisher"],
                parse: function (e, t, n) {
                    n = n || 0, t = t || 4;
                    var i = {tag: null, value: null}, r = new DataView(e);
                    if (t < 3) return l.parseLegacy(e);
                    var a = r.getString(4), u = r.getString(1);
                    r.getUint32Synch(4);
                    if (0 !== [r.getUint8(8), r.getUint8(9)][1]) return !1;
                    if (!a in l.types) return !1;
                    if (i.tag = l.types[a], "T" === u) {
                        if (0 === (s = r.getUint8(10)) || 3 === s) i.value = r.getString(-11, 11); else if (1 === s) i.value = r.getStringUtf16(-11, 11, !0); else {
                            if (2 !== s) return !1;
                            i.value = r.getStringUtf16(-11, 11)
                        }
                        "TCON" === a && parseInt(i.value) && (i.value = o[parseInt(i.value)])
                    } else if ("W" === u) i.value = r.getString(-10, 10); else if ("COMM" === a) {
                        for (var s = r.getUint8(10), g = 0, c = f = 14; ; c++) if (1 === s || 2 === s) {
                            if (0 === r.getUint16(c)) {
                                f = c + 2;
                                break
                            }
                            c++
                        } else if (0 === r.getUint8(c)) {
                            f = c + 1;
                            break
                        }
                        if (0 === s || 3 === s) i.value = r.getString(-1 * f, f); else if (1 === s) i.value = r.getStringUtf16(-1 * f, f, !0); else {
                            if (2 !== s) return !1;
                            i.value = r.getStringUtf16(-1 * f, f)
                        }
                    } else if ("APIC" === a) {
                        s = r.getUint8(10);
                        var f, p = {type: null, mime: null, description: null, data: null};
                        for (g = 0, c = f = 11; ; c++) if (0 === r.getUint8(c)) {
                            g = c - f;
                            break
                        }
                        p.mime = r.getString(g, f), p.type = l.imageTypes[r.getUint8(f + g + 1)] || "other", f += g + 2, g = 0;
                        for (c = f; ; c++) if (0 === r.getUint8(c)) {
                            g = c - f;
                            break
                        }
                        p.description = 0 === g ? null : r.getString(g, f), p.data = e.slice(f + 1), i.value = p
                    }
                    return !!i.tag && i
                },
                parseLegacy: function (e) {
                    var t = {tag: null, value: null}, n = new DataView(e), i = n.getString(3), r = n.getString(1);
                    n.getUint24(3);
                    if (!i in l.types) return !1;
                    if (t.tag = l.types[i], "T" === r) {
                        n.getUint8(7);
                        t.value = n.getString(-7, 7), "TCO" === i && parseInt(t.value) && (t.value = o[parseInt(t.value)])
                    } else if ("W" === r) t.value = n.getString(-7, 7); else if ("COM" === i) {
                        n.getUint8(6);
                        t.value = n.getString(-10, 10), -1 !== t.value.indexOf("\0") && (t.value = t.value.substr(t.value.indexOf("\0") + 1))
                    } else if ("PIC" === i) {
                        n.getUint8(6);
                        var a = {
                            type: null,
                            mime: "image/" + n.getString(3, 7).toLowerCase(),
                            description: null,
                            data: null
                        };
                        a.type = l.imageTypes[n.getUint8(11)] || "other";
                        for (var u = 0, s = 11; ; s++) if (0 === n.getUint8(s)) {
                            u = s - 11;
                            break
                        }
                        a.description = 0 === u ? null : n.getString(u, 11), a.data = e.slice(12), t.value = a
                    }
                    return !!t.tag && t
                }
            }, u = {
                parse: function (e, t) {
                    var n = {
                        title: null,
                        album: null,
                        artist: null,
                        year: null,
                        v1: {title: null, artist: null, album: null, year: null, comment: null, track: null, version: 1},
                        v2: {version: [null, null]}
                    }, i = {v1: !1, v2: !1}, r = function (e) {
                        i.v1 && i.v2 && (n.title = n.v2.title || n.v1.title, n.album = n.v2.album || n.v1.album, n.artist = n.v2.artist || n.v1.artist, n.year = n.v1.year, t(e, n))
                    };
                    e.read(128, e.size - 128, function (e, t) {
                        if (e) return r("Could not read file");
                        var a = new DataView(t);
                        if (128 !== t.byteLength || "TAG" !== a.getString(3, null, !0)) return i.v1 = !0, r();
                        n.v1.title = a.getString(30, 3).replace(/(^\s+|\s+$)/, "") || null, n.v1.artist = a.getString(30, 33).replace(/(^\s+|\s+$)/, "") || null, n.v1.album = a.getString(30, 63).replace(/(^\s+|\s+$)/, "") || null, n.v1.year = a.getString(4, 93).replace(/(^\s+|\s+$)/, "") || null, 0 === a.getUint8(125) ? (n.v1.comment = a.getString(28, 97).replace(/(^\s+|\s+$)/, ""), n.v1.version = 1.1, n.v1.track = a.getUint8(126)) : n.v1.comment = a.getString(30, 97).replace(/(^\s+|\s+$)/, ""), n.v1.genre = o[a.getUint8(127)] || null, i.v1 = !0, r()
                    }), e.read(14, 0, function (t, a) {
                        if (t) return r("Could not read file");
                        var o, u = new DataView(a), s = 10, g = 0;
                        return 14 !== a.byteLength || "ID3" !== u.getString(3, null, !0) || u.getUint8(3) > 4 ? (i.v2 = !0, r()) : (n.v2.version = [u.getUint8(3), u.getUint8(4)], 0 != (128 & (o = u.getUint8(5))) ? (i.v2 = !0, r()) : (0 != (64 & o) && (s += u.getUint32Synch(11)), g += u.getUint32Synch(6), void e.read(g, s, function (e, t) {
                            if (e) return i.v2 = !0, r();
                            for (var a = new DataView(t), o = 0; o < t.byteLength;) {
                                for (var u, s, g, c = !0, f = 0; f < 3; f++) ((g = a.getUint8(o + f)) < 65 || g > 90) && (g < 48 || g > 57) && (c = !1);
                                if (!c) break;
                                s = n.v2.version[0] < 3 ? t.slice(o, o + 6 + a.getUint24(o + 3)) : t.slice(o, o + 10 + a.getUint32Synch(o + 4)), (u = l.parse(s, n.v2.version[0])) && (n.v2[u.tag] = u.value), o += s.byteLength
                            }
                            i.v2 = !0, r()
                        })))
                    })
                }
            }, s = new e(r.type);
        s.open(r.file, function (e) {
            if (e) return i("Could not open specified file");
            u.parse(s, function (e, t) {
                i(e, t), s.close()
            })
        })
    };
    n.OPEN_FILE = e.OPEN_FILE, n.OPEN_URI = e.OPEN_URI, n.OPEN_LOCAL = e.OPEN_LOCAL, "undefined" != typeof module && module.exports ? module.exports = n : "function" == typeof define && define.amd ? define("id3", [], function () {
        return n
    }) : window.id3 = n
}();


/**
 *
 * Audio Player
 */
!function (e) {
    var t = {};

    function n(o) {
        if (t[o]) return t[o].exports;
        var r = t[o] = {i: o, l: !1, exports: {}};
        return e[o].call(r.exports, r, r.exports, n), r.l = !0, r.exports
    }

    n.m = e, n.c = t, n.d = function (e, t, o) {
        n.o(e, t) || Object.defineProperty(e, t, {enumerable: !0, get: o})
    }, n.r = function (e) {
        "undefined" != typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {value: "Module"}), Object.defineProperty(e, "__esModule", {value: !0})
    }, n.t = function (e, t) {
        if (1 & t && (e = n(e)), 8 & t) return e;
        if (4 & t && "object" == typeof e && e && e.__esModule) return e;
        var o = Object.create(null);
        if (n.r(o), Object.defineProperty(o, "default", {
            enumerable: !0,
            value: e
        }), 2 & t && "string" != typeof e) for (var r in e) n.d(o, r, function (t) {
            return e[t]
        }.bind(null, r));
        return o
    }, n.n = function (e) {
        var t = e && e.__esModule ? function () {
            return e.default
        } : function () {
            return e
        };
        return n.d(t, "a", t), t
    }, n.o = function (e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
    }, n.p = "", n(n.s = 3)
}([function (e, t, n) {
    (function (n) {
        var o;
        /*!
 *  howler.js v2.1.1
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
        /*!
 *  howler.js v2.1.1
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
        !function () {
            "use strict";
            var r = function () {
                this.init()
            };
            r.prototype = {
                init: function () {
                    var e = this || i;
                    return e._counter = 1e3, e._html5AudioPool = [], e.html5PoolSize = 10, e._codecs = {}, e._howls = [], e._muted = !1, e._volume = 1, e._canPlayEvent = "canplaythrough", e._navigator = "undefined" != typeof window && window.navigator ? window.navigator : null, e.masterGain = null, e.noAudio = !1, e.usingWebAudio = !0, e.autoSuspend = !0, e.ctx = null, e.autoUnlock = !0, e._setup(), e
                }, volume: function (e) {
                    var t = this || i;
                    if (e = parseFloat(e), t.ctx || p(), void 0 !== e && e >= 0 && e <= 1) {
                        if (t._volume = e, t._muted) return t;
                        t.usingWebAudio && t.masterGain.gain.setValueAtTime(e, i.ctx.currentTime);
                        for (var n = 0; n < t._howls.length; n++) if (!t._howls[n]._webAudio) for (var o = t._howls[n]._getSoundIds(), r = 0; r < o.length; r++) {
                            var a = t._howls[n]._soundById(o[r]);
                            a && a._node && (a._node.volume = a._volume * e)
                        }
                        return t
                    }
                    return t._volume
                }, mute: function (e) {
                    var t = this || i;
                    t.ctx || p(), t._muted = e, t.usingWebAudio && t.masterGain.gain.setValueAtTime(e ? 0 : t._volume, i.ctx.currentTime);
                    for (var n = 0; n < t._howls.length; n++) if (!t._howls[n]._webAudio) for (var o = t._howls[n]._getSoundIds(), r = 0; r < o.length; r++) {
                        var a = t._howls[n]._soundById(o[r]);
                        a && a._node && (a._node.muted = !!e || a._muted)
                    }
                    return t
                }, unload: function () {
                    for (var e = this || i, t = e._howls.length - 1; t >= 0; t--) e._howls[t].unload();
                    return e.usingWebAudio && e.ctx && void 0 !== e.ctx.close && (e.ctx.close(), e.ctx = null, p()), e
                }, codecs: function (e) {
                    return (this || i)._codecs[e.replace(/^x-/, "")]
                }, _setup: function () {
                    var e = this || i;
                    if (e.state = e.ctx && e.ctx.state || "suspended", e._autoSuspend(), !e.usingWebAudio) if ("undefined" != typeof Audio) try {
                        void 0 === (new Audio).oncanplaythrough && (e._canPlayEvent = "canplay")
                    } catch (t) {
                        e.noAudio = !0
                    } else e.noAudio = !0;
                    try {
                        (new Audio).muted && (e.noAudio = !0)
                    } catch (e) {
                    }
                    return e.noAudio || e._setupCodecs(), e
                }, _setupCodecs: function () {
                    var e = this || i, t = null;
                    try {
                        t = "undefined" != typeof Audio ? new Audio : null
                    } catch (t) {
                        return e
                    }
                    if (!t || "function" != typeof t.canPlayType) return e;
                    var n = t.canPlayType("audio/mpeg;").replace(/^no$/, ""),
                        o = e._navigator && e._navigator.userAgent.match(/OPR\/([0-6].)/g),
                        r = o && parseInt(o[0].split("/")[1], 10) < 33;
                    return e._codecs = {
                        mp3: !(r || !n && !t.canPlayType("audio/mp3;").replace(/^no$/, "")),
                        mpeg: !!n,
                        opus: !!t.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ""),
                        ogg: !!t.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                        oga: !!t.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""),
                        wav: !!t.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""),
                        aac: !!t.canPlayType("audio/aac;").replace(/^no$/, ""),
                        caf: !!t.canPlayType("audio/x-caf;").replace(/^no$/, ""),
                        m4a: !!(t.canPlayType("audio/x-m4a;") || t.canPlayType("audio/m4a;") || t.canPlayType("audio/aac;")).replace(/^no$/, ""),
                        mp4: !!(t.canPlayType("audio/x-mp4;") || t.canPlayType("audio/mp4;") || t.canPlayType("audio/aac;")).replace(/^no$/, ""),
                        weba: !!t.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ""),
                        webm: !!t.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ""),
                        dolby: !!t.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ""),
                        flac: !!(t.canPlayType("audio/x-flac;") || t.canPlayType("audio/flac;")).replace(/^no$/, "")
                    }, e
                }, _unlockAudio: function () {
                    var e = this || i,
                        t = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi|Chrome|Safari/i.test(e._navigator && e._navigator.userAgent);
                    if (!e._audioUnlocked && e.ctx && t) {
                        e._audioUnlocked = !1, e.autoUnlock = !1, e._mobileUnloaded || 44100 === e.ctx.sampleRate || (e._mobileUnloaded = !0, e.unload()), e._scratchBuffer = e.ctx.createBuffer(1, 1, 22050);
                        var n = function (t) {
                            for (var o = 0; o < e.html5PoolSize; o++) {
                                var r = new Audio;
                                r._unlocked = !0, e._releaseHtml5Audio(r)
                            }
                            for (o = 0; o < e._howls.length; o++) if (!e._howls[o]._webAudio) for (var i = e._howls[o]._getSoundIds(), a = 0; a < i.length; a++) {
                                var s = e._howls[o]._soundById(i[a]);
                                s && s._node && !s._node._unlocked && (s._node._unlocked = !0, s._node.load())
                            }
                            e._autoResume();
                            var u = e.ctx.createBufferSource();
                            u.buffer = e._scratchBuffer, u.connect(e.ctx.destination), void 0 === u.start ? u.noteOn(0) : u.start(0), "function" == typeof e.ctx.resume && e.ctx.resume(), u.onended = function () {
                                u.disconnect(0), e._audioUnlocked = !0, document.removeEventListener("touchstart", n, !0), document.removeEventListener("touchend", n, !0), document.removeEventListener("click", n, !0);
                                for (var t = 0; t < e._howls.length; t++) e._howls[t]._emit("unlock")
                            }
                        };
                        return document.addEventListener("touchstart", n, !0), document.addEventListener("touchend", n, !0), document.addEventListener("click", n, !0), e
                    }
                }, _obtainHtml5Audio: function () {
                    var e = this || i;
                    if (e._html5AudioPool.length) return e._html5AudioPool.pop();
                    var t = (new Audio).play();
                    return t && "undefined" != typeof Promise && (t instanceof Promise || "function" == typeof t.then) && t.catch(function () {
                        console.warn("HTML5 Audio pool exhausted, returning potentially locked audio object.")
                    }), new Audio
                }, _releaseHtml5Audio: function (e) {
                    var t = this || i;
                    return e._unlocked && t._html5AudioPool.push(e), t
                }, _autoSuspend: function () {
                    var e = this;
                    if (e.autoSuspend && e.ctx && void 0 !== e.ctx.suspend && i.usingWebAudio) {
                        for (var t = 0; t < e._howls.length; t++) if (e._howls[t]._webAudio) for (var n = 0; n < e._howls[t]._sounds.length; n++) if (!e._howls[t]._sounds[n]._paused) return e;
                        return e._suspendTimer && clearTimeout(e._suspendTimer), e._suspendTimer = setTimeout(function () {
                            e.autoSuspend && (e._suspendTimer = null, e.state = "suspending", e.ctx.suspend().then(function () {
                                e.state = "suspended", e._resumeAfterSuspend && (delete e._resumeAfterSuspend, e._autoResume())
                            }))
                        }, 3e4), e
                    }
                }, _autoResume: function () {
                    var e = this;
                    if (e.ctx && void 0 !== e.ctx.resume && i.usingWebAudio) return "running" === e.state && e._suspendTimer ? (clearTimeout(e._suspendTimer), e._suspendTimer = null) : "suspended" === e.state ? (e.ctx.resume().then(function () {
                        e.state = "running";
                        for (var t = 0; t < e._howls.length; t++) e._howls[t]._emit("resume")
                    }), e._suspendTimer && (clearTimeout(e._suspendTimer), e._suspendTimer = null)) : "suspending" === e.state && (e._resumeAfterSuspend = !0), e
                }
            };
            var i = new r, a = function (e) {
                e.src && 0 !== e.src.length ? this.init(e) : console.error("An array of source files must be passed with any new Howl.")
            };
            a.prototype = {
                init: function (e) {
                    var t = this;
                    return i.ctx || p(), t._autoplay = e.autoplay || !1, t._format = "string" != typeof e.format ? e.format : [e.format], t._html5 = e.html5 || !1, t._muted = e.mute || !1, t._loop = e.loop || !1, t._pool = e.pool || 5, t._preload = "boolean" != typeof e.preload || e.preload, t._rate = e.rate || 1, t._sprite = e.sprite || {}, t._src = "string" != typeof e.src ? e.src : [e.src], t._volume = void 0 !== e.volume ? e.volume : 1, t._xhrWithCredentials = e.xhrWithCredentials || !1, t._duration = 0, t._state = "unloaded", t._sounds = [], t._endTimers = {}, t._queue = [], t._playLock = !1, t._onend = e.onend ? [{fn: e.onend}] : [], t._onfade = e.onfade ? [{fn: e.onfade}] : [], t._onload = e.onload ? [{fn: e.onload}] : [], t._onloaderror = e.onloaderror ? [{fn: e.onloaderror}] : [], t._onplayerror = e.onplayerror ? [{fn: e.onplayerror}] : [], t._onpause = e.onpause ? [{fn: e.onpause}] : [], t._onplay = e.onplay ? [{fn: e.onplay}] : [], t._onstop = e.onstop ? [{fn: e.onstop}] : [], t._onmute = e.onmute ? [{fn: e.onmute}] : [], t._onvolume = e.onvolume ? [{fn: e.onvolume}] : [], t._onrate = e.onrate ? [{fn: e.onrate}] : [], t._onseek = e.onseek ? [{fn: e.onseek}] : [], t._onunlock = e.onunlock ? [{fn: e.onunlock}] : [], t._onresume = [], t._webAudio = i.usingWebAudio && !t._html5, void 0 !== i.ctx && i.ctx && i.autoUnlock && i._unlockAudio(), i._howls.push(t), t._autoplay && t._queue.push({
                        event: "play",
                        action: function () {
                            t.play()
                        }
                    }), t._preload && t.load(), t
                }, load: function () {
                    var e = null;
                    if (i.noAudio) this._emit("loaderror", null, "No audio support."); else {
                        "string" == typeof this._src && (this._src = [this._src]);
                        for (var t = 0; t < this._src.length; t++) {
                            var n, o;
                            if (this._format && this._format[t]) n = this._format[t]; else {
                                if ("string" != typeof (o = this._src[t])) {
                                    this._emit("loaderror", null, "Non-string found in selected audio sources - ignoring.");
                                    continue
                                }
                                (n = /^data:audio\/([^;,]+);/i.exec(o)) || (n = /\.([^.]+)$/.exec(o.split("?", 1)[0])), n && (n = n[1].toLowerCase())
                            }
                            if (n || console.warn('No file extension was found. Consider using the "format" property or specify an extension.'), n && i.codecs(n)) {
                                e = this._src[t];
                                break
                            }
                        }
                        if (e) return this._src = e, this._state = "loading", "https:" === window.location.protocol && "http:" === e.slice(0, 5) && (this._html5 = !0, this._webAudio = !1), new s(this), this._webAudio && l(this), this;
                        this._emit("loaderror", null, "No codec support for selected audio sources.")
                    }
                }, play: function (e, t) {
                    var n = this, o = null;
                    if ("number" == typeof e) o = e, e = null; else {
                        if ("string" == typeof e && "loaded" === n._state && !n._sprite[e]) return null;
                        if (void 0 === e && (e = "__default", !n._playLock)) {
                            for (var r = 0, a = 0; a < n._sounds.length; a++) n._sounds[a]._paused && !n._sounds[a]._ended && (r++, o = n._sounds[a]._id);
                            1 === r ? e = null : o = null
                        }
                    }
                    var s = o ? n._soundById(o) : n._inactiveSound();
                    if (!s) return null;
                    if (o && !e && (e = s._sprite || "__default"), "loaded" !== n._state) {
                        s._sprite = e, s._ended = !1;
                        var u = s._id;
                        return n._queue.push({
                            event: "play", action: function () {
                                n.play(u)
                            }
                        }), u
                    }
                    if (o && !s._paused) return t || n._loadQueue("play"), s._id;
                    n._webAudio && i._autoResume();
                    var l = Math.max(0, s._seek > 0 ? s._seek : n._sprite[e][0] / 1e3),
                        c = Math.max(0, (n._sprite[e][0] + n._sprite[e][1]) / 1e3 - l), d = 1e3 * c / Math.abs(s._rate),
                        _ = n._sprite[e][0] / 1e3, p = (n._sprite[e][0] + n._sprite[e][1]) / 1e3,
                        f = !(!s._loop && !n._sprite[e][2]);
                    s._sprite = e, s._ended = !1;
                    var h = function () {
                        s._paused = !1, s._seek = l, s._start = _, s._stop = p, s._loop = f
                    };
                    if (!(l >= p)) {
                        var m = s._node;
                        if (n._webAudio) {
                            var v = function () {
                                n._playLock = !1, h(), n._refreshBuffer(s);
                                var e = s._muted || n._muted ? 0 : s._volume;
                                m.gain.setValueAtTime(e, i.ctx.currentTime), s._playStart = i.ctx.currentTime, void 0 === m.bufferSource.start ? s._loop ? m.bufferSource.noteGrainOn(0, l, 86400) : m.bufferSource.noteGrainOn(0, l, c) : s._loop ? m.bufferSource.start(0, l, 86400) : m.bufferSource.start(0, l, c), d !== 1 / 0 && (n._endTimers[s._id] = setTimeout(n._ended.bind(n, s), d)), t || setTimeout(function () {
                                    n._emit("play", s._id), n._loadQueue()
                                }, 0)
                            };
                            "running" === i.state ? v() : (n._playLock = !0, n.once("resume", v), n._clearTimer(s._id))
                        } else {
                            var g = function () {
                                m.currentTime = l, m.muted = s._muted || n._muted || i._muted || m.muted, m.volume = s._volume * i.volume(), m.playbackRate = s._rate;
                                try {
                                    var o = m.play();
                                    if (o && "undefined" != typeof Promise && (o instanceof Promise || "function" == typeof o.then) ? (n._playLock = !0, h(), o.then(function () {
                                        n._playLock = !1, m._unlocked = !0, t || (n._emit("play", s._id), n._loadQueue())
                                    }).catch(function () {
                                        n._playLock = !1, n._emit("playerror", s._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction."), s._ended = !0, s._paused = !0
                                    })) : t || (n._playLock = !1, h(), n._emit("play", s._id), n._loadQueue()), m.playbackRate = s._rate, m.paused) return void n._emit("playerror", s._id, "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.");
                                    "__default" !== e || s._loop ? n._endTimers[s._id] = setTimeout(n._ended.bind(n, s), d) : (n._endTimers[s._id] = function () {
                                        n._ended(s), m.removeEventListener("ended", n._endTimers[s._id], !1)
                                    }, m.addEventListener("ended", n._endTimers[s._id], !1))
                                } catch (e) {
                                    n._emit("playerror", s._id, e)
                                }
                            }, y = window && window.ejecta || !m.readyState && i._navigator.isCocoonJS;
                            if (m.readyState >= 3 || y) g(); else {
                                n._playLock = !0;
                                var w = function () {
                                    g(), m.removeEventListener(i._canPlayEvent, w, !1)
                                };
                                m.addEventListener(i._canPlayEvent, w, !1), n._clearTimer(s._id)
                            }
                        }
                        return s._id
                    }
                    n._ended(s)
                }, pause: function (e) {
                    var t = this;
                    if ("loaded" !== t._state || t._playLock) return t._queue.push({
                        event: "pause",
                        action: function () {
                            t.pause(e)
                        }
                    }), t;
                    for (var n = t._getSoundIds(e), o = 0; o < n.length; o++) {
                        t._clearTimer(n[o]);
                        var r = t._soundById(n[o]);
                        if (r && !r._paused && (r._seek = t.seek(n[o]), r._rateSeek = 0, r._paused = !0, t._stopFade(n[o]), r._node)) if (t._webAudio) {
                            if (!r._node.bufferSource) continue;
                            void 0 === r._node.bufferSource.stop ? r._node.bufferSource.noteOff(0) : r._node.bufferSource.stop(0), t._cleanBuffer(r._node)
                        } else isNaN(r._node.duration) && r._node.duration !== 1 / 0 || r._node.pause();
                        arguments[1] || t._emit("pause", r ? r._id : null)
                    }
                    return t
                }, stop: function (e, t) {
                    var n = this;
                    if ("loaded" !== n._state || n._playLock) return n._queue.push({
                        event: "stop", action: function () {
                            n.stop(e)
                        }
                    }), n;
                    for (var o = n._getSoundIds(e), r = 0; r < o.length; r++) {
                        n._clearTimer(o[r]);
                        var i = n._soundById(o[r]);
                        i && (i._seek = i._start || 0, i._rateSeek = 0, i._paused = !0, i._ended = !0, n._stopFade(o[r]), i._node && (n._webAudio ? i._node.bufferSource && (void 0 === i._node.bufferSource.stop ? i._node.bufferSource.noteOff(0) : i._node.bufferSource.stop(0), n._cleanBuffer(i._node)) : isNaN(i._node.duration) && i._node.duration !== 1 / 0 || (i._node.currentTime = i._start || 0, i._node.pause())), t || n._emit("stop", i._id))
                    }
                    return n
                }, mute: function (e, t) {
                    var n = this;
                    if ("loaded" !== n._state || n._playLock) return n._queue.push({
                        event: "mute", action: function () {
                            n.mute(e, t)
                        }
                    }), n;
                    if (void 0 === t) {
                        if ("boolean" != typeof e) return n._muted;
                        n._muted = e
                    }
                    for (var o = n._getSoundIds(t), r = 0; r < o.length; r++) {
                        var a = n._soundById(o[r]);
                        a && (a._muted = e, a._interval && n._stopFade(a._id), n._webAudio && a._node ? a._node.gain.setValueAtTime(e ? 0 : a._volume, i.ctx.currentTime) : a._node && (a._node.muted = !!i._muted || e), n._emit("mute", a._id))
                    }
                    return n
                }, volume: function () {
                    var e, t, n, o = this, r = arguments;
                    if (0 === r.length) return o._volume;
                    if (1 === r.length || 2 === r.length && void 0 === r[1] ? o._getSoundIds().indexOf(r[0]) >= 0 ? t = parseInt(r[0], 10) : e = parseFloat(r[0]) : r.length >= 2 && (e = parseFloat(r[0]), t = parseInt(r[1], 10)), !(void 0 !== e && e >= 0 && e <= 1)) return (n = t ? o._soundById(t) : o._sounds[0]) ? n._volume : 0;
                    if ("loaded" !== o._state || o._playLock) return o._queue.push({
                        event: "volume",
                        action: function () {
                            o.volume.apply(o, r)
                        }
                    }), o;
                    void 0 === t && (o._volume = e), t = o._getSoundIds(t);
                    for (var a = 0; a < t.length; a++) (n = o._soundById(t[a])) && (n._volume = e, r[2] || o._stopFade(t[a]), o._webAudio && n._node && !n._muted ? n._node.gain.setValueAtTime(e, i.ctx.currentTime) : n._node && !n._muted && (n._node.volume = e * i.volume()), o._emit("volume", n._id));
                    return o
                }, fade: function (e, t, n, o) {
                    var r = this;
                    if ("loaded" !== r._state || r._playLock) return r._queue.push({
                        event: "fade", action: function () {
                            r.fade(e, t, n, o)
                        }
                    }), r;
                    e = parseFloat(e), t = parseFloat(t), n = parseFloat(n), r.volume(e, o);
                    for (var a = r._getSoundIds(o), s = 0; s < a.length; s++) {
                        var u = r._soundById(a[s]);
                        if (u) {
                            if (o || r._stopFade(a[s]), r._webAudio && !u._muted) {
                                var l = i.ctx.currentTime, c = l + n / 1e3;
                                u._volume = e, u._node.gain.setValueAtTime(e, l), u._node.gain.linearRampToValueAtTime(t, c)
                            }
                            r._startFadeInterval(u, e, t, n, a[s], void 0 === o)
                        }
                    }
                    return r
                }, _startFadeInterval: function (e, t, n, o, r, i) {
                    var a = this, s = t, u = n - t, l = Math.abs(u / .01), c = Math.max(4, l > 0 ? o / l : o),
                        d = Date.now();
                    e._fadeTo = n, e._interval = setInterval(function () {
                        var r = (Date.now() - d) / o;
                        d = Date.now(), s += u * r, s = Math.max(0, s), s = Math.min(1, s), s = Math.round(100 * s) / 100, a._webAudio ? e._volume = s : a.volume(s, e._id, !0), i && (a._volume = s), (n < t && s <= n || n > t && s >= n) && (clearInterval(e._interval), e._interval = null, e._fadeTo = null, a.volume(n, e._id), a._emit("fade", e._id))
                    }, c)
                }, _stopFade: function (e) {
                    var t = this._soundById(e);
                    return t && t._interval && (this._webAudio && t._node.gain.cancelScheduledValues(i.ctx.currentTime), clearInterval(t._interval), t._interval = null, this.volume(t._fadeTo, e), t._fadeTo = null, this._emit("fade", e)), this
                }, loop: function () {
                    var e, t, n, o = arguments;
                    if (0 === o.length) return this._loop;
                    if (1 === o.length) {
                        if ("boolean" != typeof o[0]) return !!(n = this._soundById(parseInt(o[0], 10))) && n._loop;
                        e = o[0], this._loop = e
                    } else 2 === o.length && (e = o[0], t = parseInt(o[1], 10));
                    for (var r = this._getSoundIds(t), i = 0; i < r.length; i++) (n = this._soundById(r[i])) && (n._loop = e, this._webAudio && n._node && n._node.bufferSource && (n._node.bufferSource.loop = e, e && (n._node.bufferSource.loopStart = n._start || 0, n._node.bufferSource.loopEnd = n._stop)));
                    return this
                }, rate: function () {
                    var e, t, n, o = this, r = arguments;
                    if (0 === r.length) t = o._sounds[0]._id; else if (1 === r.length) {
                        o._getSoundIds().indexOf(r[0]) >= 0 ? t = parseInt(r[0], 10) : e = parseFloat(r[0])
                    } else 2 === r.length && (e = parseFloat(r[0]), t = parseInt(r[1], 10));
                    if ("number" != typeof e) return (n = o._soundById(t)) ? n._rate : o._rate;
                    if ("loaded" !== o._state || o._playLock) return o._queue.push({
                        event: "rate", action: function () {
                            o.rate.apply(o, r)
                        }
                    }), o;
                    void 0 === t && (o._rate = e), t = o._getSoundIds(t);
                    for (var a = 0; a < t.length; a++) if (n = o._soundById(t[a])) {
                        o.playing(t[a]) && (n._rateSeek = o.seek(t[a]), n._playStart = o._webAudio ? i.ctx.currentTime : n._playStart), n._rate = e, o._webAudio && n._node && n._node.bufferSource ? n._node.bufferSource.playbackRate.setValueAtTime(e, i.ctx.currentTime) : n._node && (n._node.playbackRate = e);
                        var s = o.seek(t[a]),
                            u = 1e3 * ((o._sprite[n._sprite][0] + o._sprite[n._sprite][1]) / 1e3 - s) / Math.abs(n._rate);
                        !o._endTimers[t[a]] && n._paused || (o._clearTimer(t[a]), o._endTimers[t[a]] = setTimeout(o._ended.bind(o, n), u)), o._emit("rate", n._id)
                    }
                    return o
                }, seek: function () {
                    var e, t, n = this, o = arguments;
                    if (0 === o.length) t = n._sounds[0]._id; else if (1 === o.length) {
                        n._getSoundIds().indexOf(o[0]) >= 0 ? t = parseInt(o[0], 10) : n._sounds.length && (t = n._sounds[0]._id, e = parseFloat(o[0]))
                    } else 2 === o.length && (e = parseFloat(o[0]), t = parseInt(o[1], 10));
                    if (void 0 === t) return n;
                    if ("loaded" !== n._state || n._playLock) return n._queue.push({
                        event: "seek", action: function () {
                            n.seek.apply(n, o)
                        }
                    }), n;
                    var r = n._soundById(t);
                    if (r) {
                        if (!("number" == typeof e && e >= 0)) {
                            if (n._webAudio) {
                                var a = n.playing(t) ? i.ctx.currentTime - r._playStart : 0,
                                    s = r._rateSeek ? r._rateSeek - r._seek : 0;
                                return r._seek + (s + a * Math.abs(r._rate))
                            }
                            return r._node.currentTime
                        }
                        var u = n.playing(t);
                        u && n.pause(t, !0), r._seek = e, r._ended = !1, n._clearTimer(t), n._webAudio || !r._node || isNaN(r._node.duration) || (r._node.currentTime = e);
                        var l = function () {
                            n._emit("seek", t), u && n.play(t, !0)
                        };
                        if (u && !n._webAudio) {
                            var c = function () {
                                n._playLock ? setTimeout(c, 0) : l()
                            };
                            setTimeout(c, 0)
                        } else l()
                    }
                    return n
                }, playing: function (e) {
                    if ("number" == typeof e) {
                        var t = this._soundById(e);
                        return !!t && !t._paused
                    }
                    for (var n = 0; n < this._sounds.length; n++) if (!this._sounds[n]._paused) return !0;
                    return !1
                }, duration: function (e) {
                    var t = this._duration, n = this._soundById(e);
                    return n && (t = this._sprite[n._sprite][1] / 1e3), t
                }, state: function () {
                    return this._state
                }, unload: function () {
                    for (var e = this, t = e._sounds, n = 0; n < t.length; n++) {
                        if (t[n]._paused || e.stop(t[n]._id), !e._webAudio) /MSIE |Trident\//.test(i._navigator && i._navigator.userAgent) || (t[n]._node.src = "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA"), t[n]._node.removeEventListener("error", t[n]._errorFn, !1), t[n]._node.removeEventListener(i._canPlayEvent, t[n]._loadFn, !1), i._releaseHtml5Audio(t[n]._node);
                        delete t[n]._node, e._clearTimer(t[n]._id)
                    }
                    var o = i._howls.indexOf(e);
                    o >= 0 && i._howls.splice(o, 1);
                    var r = !0;
                    for (n = 0; n < i._howls.length; n++) if (i._howls[n]._src === e._src || e._src.indexOf(i._howls[n]._src) >= 0) {
                        r = !1;
                        break
                    }
                    return u && r && delete u[e._src], i.noAudio = !1, e._state = "unloaded", e._sounds = [], e = null, null
                }, on: function (e, t, n, o) {
                    var r = this["_on" + e];
                    return "function" == typeof t && r.push(o ? {id: n, fn: t, once: o} : {id: n, fn: t}), this
                }, off: function (e, t, n) {
                    var o = this["_on" + e], r = 0;
                    if ("number" == typeof t && (n = t, t = null), t || n) for (r = 0; r < o.length; r++) {
                        var i = n === o[r].id;
                        if (t === o[r].fn && i || !t && i) {
                            o.splice(r, 1);
                            break
                        }
                    } else if (e) this["_on" + e] = []; else {
                        var a = Object.keys(this);
                        for (r = 0; r < a.length; r++) 0 === a[r].indexOf("_on") && Array.isArray(this[a[r]]) && (this[a[r]] = [])
                    }
                    return this
                }, once: function (e, t, n) {
                    return this.on(e, t, n, 1), this
                }, _emit: function (e, t, n) {
                    for (var o = this["_on" + e], r = o.length - 1; r >= 0; r--) o[r].id && o[r].id !== t && "load" !== e || (setTimeout(function (e) {
                        e.call(this, t, n)
                    }.bind(this, o[r].fn), 0), o[r].once && this.off(e, o[r].fn, o[r].id));
                    return this._loadQueue(e), this
                }, _loadQueue: function (e) {
                    if (this._queue.length > 0) {
                        var t = this._queue[0];
                        t.event === e && (this._queue.shift(), this._loadQueue()), e || t.action()
                    }
                    return this
                }, _ended: function (e) {
                    var t = e._sprite;
                    if (!this._webAudio && e._node && !e._node.paused && !e._node.ended && e._node.currentTime < e._stop) return setTimeout(this._ended.bind(this, e), 100), this;
                    var n = !(!e._loop && !this._sprite[t][2]);
                    if (this._emit("end", e._id), !this._webAudio && n && this.stop(e._id, !0).play(e._id), this._webAudio && n) {
                        this._emit("play", e._id), e._seek = e._start || 0, e._rateSeek = 0, e._playStart = i.ctx.currentTime;
                        var o = 1e3 * (e._stop - e._start) / Math.abs(e._rate);
                        this._endTimers[e._id] = setTimeout(this._ended.bind(this, e), o)
                    }
                    return this._webAudio && !n && (e._paused = !0, e._ended = !0, e._seek = e._start || 0, e._rateSeek = 0, this._clearTimer(e._id), this._cleanBuffer(e._node), i._autoSuspend()), this._webAudio || n || this.stop(e._id, !0), this
                }, _clearTimer: function (e) {
                    if (this._endTimers[e]) {
                        if ("function" != typeof this._endTimers[e]) clearTimeout(this._endTimers[e]); else {
                            var t = this._soundById(e);
                            t && t._node && t._node.removeEventListener("ended", this._endTimers[e], !1)
                        }
                        delete this._endTimers[e]
                    }
                    return this
                }, _soundById: function (e) {
                    for (var t = 0; t < this._sounds.length; t++) if (e === this._sounds[t]._id) return this._sounds[t];
                    return null
                }, _inactiveSound: function () {
                    this._drain();
                    for (var e = 0; e < this._sounds.length; e++) if (this._sounds[e]._ended) return this._sounds[e].reset();
                    return new s(this)
                }, _drain: function () {
                    var e = this._pool, t = 0, n = 0;
                    if (!(this._sounds.length < e)) {
                        for (n = 0; n < this._sounds.length; n++) this._sounds[n]._ended && t++;
                        for (n = this._sounds.length - 1; n >= 0; n--) {
                            if (t <= e) return;
                            this._sounds[n]._ended && (this._webAudio && this._sounds[n]._node && this._sounds[n]._node.disconnect(0), this._sounds.splice(n, 1), t--)
                        }
                    }
                }, _getSoundIds: function (e) {
                    if (void 0 === e) {
                        for (var t = [], n = 0; n < this._sounds.length; n++) t.push(this._sounds[n]._id);
                        return t
                    }
                    return [e]
                }, _refreshBuffer: function (e) {
                    return e._node.bufferSource = i.ctx.createBufferSource(), e._node.bufferSource.buffer = u[this._src], e._panner ? e._node.bufferSource.connect(e._panner) : e._node.bufferSource.connect(e._node), e._node.bufferSource.loop = e._loop, e._loop && (e._node.bufferSource.loopStart = e._start || 0, e._node.bufferSource.loopEnd = e._stop || 0), e._node.bufferSource.playbackRate.setValueAtTime(e._rate, i.ctx.currentTime), this
                }, _cleanBuffer: function (e) {
                    var t = i._navigator && i._navigator.vendor.indexOf("Apple") >= 0;
                    if (i._scratchBuffer && e.bufferSource && (e.bufferSource.onended = null, e.bufferSource.disconnect(0), t)) try {
                        e.bufferSource.buffer = i._scratchBuffer
                    } catch (e) {
                    }
                    return e.bufferSource = null, this
                }
            };
            var s = function (e) {
                this._parent = e, this.init()
            };
            s.prototype = {
                init: function () {
                    var e = this._parent;
                    return this._muted = e._muted, this._loop = e._loop, this._volume = e._volume, this._rate = e._rate, this._seek = 0, this._paused = !0, this._ended = !0, this._sprite = "__default", this._id = ++i._counter, e._sounds.push(this), this.create(), this
                }, create: function () {
                    var e = this._parent, t = i._muted || this._muted || this._parent._muted ? 0 : this._volume;
                    return e._webAudio ? (this._node = void 0 === i.ctx.createGain ? i.ctx.createGainNode() : i.ctx.createGain(), this._node.gain.setValueAtTime(t, i.ctx.currentTime), this._node.paused = !0, this._node.connect(i.masterGain)) : (this._node = i._obtainHtml5Audio(), this._errorFn = this._errorListener.bind(this), this._node.addEventListener("error", this._errorFn, !1), this._loadFn = this._loadListener.bind(this), this._node.addEventListener(i._canPlayEvent, this._loadFn, !1), this._node.src = e._src, this._node.preload = "auto", this._node.volume = t * i.volume(), this._node.load()), this
                }, reset: function () {
                    var e = this._parent;
                    return this._muted = e._muted, this._loop = e._loop, this._volume = e._volume, this._rate = e._rate, this._seek = 0, this._rateSeek = 0, this._paused = !0, this._ended = !0, this._sprite = "__default", this._id = ++i._counter, this
                }, _errorListener: function () {
                    this._parent._emit("loaderror", this._id, this._node.error ? this._node.error.code : 0), this._node.removeEventListener("error", this._errorFn, !1)
                }, _loadListener: function () {
                    var e = this._parent;
                    e._duration = Math.ceil(10 * this._node.duration) / 10, 0 === Object.keys(e._sprite).length && (e._sprite = {__default: [0, 1e3 * e._duration]}), "loaded" !== e._state && (e._state = "loaded", e._emit("load"), e._loadQueue()), this._node.removeEventListener(i._canPlayEvent, this._loadFn, !1)
                }
            };
            var u = {}, l = function (e) {
                var t = e._src;
                if (u[t]) return e._duration = u[t].duration, void _(e);
                if (/^data:[^;]+;base64,/.test(t)) {
                    for (var n = atob(t.split(",")[1]), o = new Uint8Array(n.length), r = 0; r < n.length; ++r) o[r] = n.charCodeAt(r);
                    d(o.buffer, e)
                } else {
                    var i = new XMLHttpRequest;
                    i.open("GET", t, !0), i.withCredentials = e._xhrWithCredentials, i.responseType = "arraybuffer", i.onload = function () {
                        var t = (i.status + "")[0];
                        "0" === t || "2" === t || "3" === t ? d(i.response, e) : e._emit("loaderror", null, "Failed loading audio file with status: " + i.status + ".")
                    }, i.onerror = function () {
                        e._webAudio && (e._html5 = !0, e._webAudio = !1, e._sounds = [], delete u[t], e.load())
                    }, c(i)
                }
            }, c = function (e) {
                try {
                    e.send()
                } catch (t) {
                    e.onerror()
                }
            }, d = function (e, t) {
                var n = function () {
                    t._emit("loaderror", null, "Decoding audio data failed.")
                }, o = function (e) {
                    e && t._sounds.length > 0 ? (u[t._src] = e, _(t, e)) : n()
                };
                "undefined" != typeof Promise && 1 === i.ctx.decodeAudioData.length ? i.ctx.decodeAudioData(e).then(o).catch(n) : i.ctx.decodeAudioData(e, o, n)
            }, _ = function (e, t) {
                t && !e._duration && (e._duration = t.duration), 0 === Object.keys(e._sprite).length && (e._sprite = {__default: [0, 1e3 * e._duration]}), "loaded" !== e._state && (e._state = "loaded", e._emit("load"), e._loadQueue())
            }, p = function () {
                if (i.usingWebAudio) {
                    try {
                        "undefined" != typeof AudioContext ? i.ctx = new AudioContext : "undefined" != typeof webkitAudioContext ? i.ctx = new webkitAudioContext : i.usingWebAudio = !1
                    } catch (e) {
                        i.usingWebAudio = !1
                    }
                    i.ctx || (i.usingWebAudio = !1);
                    var e = /iP(hone|od|ad)/.test(i._navigator && i._navigator.platform),
                        t = i._navigator && i._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/),
                        n = t ? parseInt(t[1], 10) : null;
                    if (e && n && n < 9) {
                        var o = /safari/.test(i._navigator && i._navigator.userAgent.toLowerCase());
                        (i._navigator && i._navigator.standalone && !o || i._navigator && !i._navigator.standalone && !o) && (i.usingWebAudio = !1)
                    }
                    i.usingWebAudio && (i.masterGain = void 0 === i.ctx.createGain ? i.ctx.createGainNode() : i.ctx.createGain(), i.masterGain.gain.setValueAtTime(i._muted ? 0 : 1, i.ctx.currentTime), i.masterGain.connect(i.ctx.destination)), i._setup()
                }
            };
            void 0 === (o = function () {
                return {Howler: i, Howl: a}
            }.apply(t, [])) || (e.exports = o), t.Howler = i, t.Howl = a, "undefined" != typeof window ? (window.HowlerGlobal = r, window.Howler = i, window.Howl = a, window.Sound = s) : void 0 !== n && (n.HowlerGlobal = r, n.Howler = i, n.Howl = a, n.Sound = s)
        }(),
            /*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *
 *  howler.js v2.1.1
 *  howlerjs.com
 *
 *  (c) 2013-2018, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */
            function () {
                "use strict";
                var e;
                HowlerGlobal.prototype._pos = [0, 0, 0], HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0], HowlerGlobal.prototype.stereo = function (e) {
                    if (!this.ctx || !this.ctx.listener) return this;
                    for (var t = this._howls.length - 1; t >= 0; t--) this._howls[t].stereo(e);
                    return this
                }, HowlerGlobal.prototype.pos = function (e, t, n) {
                    return this.ctx && this.ctx.listener ? (t = "number" != typeof t ? this._pos[1] : t, n = "number" != typeof n ? this._pos[2] : n, "number" != typeof e ? this._pos : (this._pos = [e, t, n], void 0 !== this.ctx.listener.positionX ? (this.ctx.listener.positionX.setTargetAtTime(this._pos[0], Howler.ctx.currentTime, .1), this.ctx.listener.positionY.setTargetAtTime(this._pos[1], Howler.ctx.currentTime, .1), this.ctx.listener.positionZ.setTargetAtTime(this._pos[2], Howler.ctx.currentTime, .1)) : this.ctx.listener.setPosition(this._pos[0], this._pos[1], this._pos[2]), this)) : this
                }, HowlerGlobal.prototype.orientation = function (e, t, n, o, r, i) {
                    if (!this.ctx || !this.ctx.listener) return this;
                    var a = this._orientation;
                    return t = "number" != typeof t ? a[1] : t, n = "number" != typeof n ? a[2] : n, o = "number" != typeof o ? a[3] : o, r = "number" != typeof r ? a[4] : r, i = "number" != typeof i ? a[5] : i, "number" != typeof e ? a : (this._orientation = [e, t, n, o, r, i], void 0 !== this.ctx.listener.forwardX ? (this.ctx.listener.forwardX.setTargetAtTime(e, Howler.ctx.currentTime, .1), this.ctx.listener.forwardY.setTargetAtTime(t, Howler.ctx.currentTime, .1), this.ctx.listener.forwardZ.setTargetAtTime(n, Howler.ctx.currentTime, .1), this.ctx.listener.upX.setTargetAtTime(e, Howler.ctx.currentTime, .1), this.ctx.listener.upY.setTargetAtTime(t, Howler.ctx.currentTime, .1), this.ctx.listener.upZ.setTargetAtTime(n, Howler.ctx.currentTime, .1)) : this.ctx.listener.setOrientation(e, t, n, o, r, i), this)
                }, Howl.prototype.init = (e = Howl.prototype.init, function (t) {
                    return this._orientation = t.orientation || [1, 0, 0], this._stereo = t.stereo || null, this._pos = t.pos || null, this._pannerAttr = {
                        coneInnerAngle: void 0 !== t.coneInnerAngle ? t.coneInnerAngle : 360,
                        coneOuterAngle: void 0 !== t.coneOuterAngle ? t.coneOuterAngle : 360,
                        coneOuterGain: void 0 !== t.coneOuterGain ? t.coneOuterGain : 0,
                        distanceModel: void 0 !== t.distanceModel ? t.distanceModel : "inverse",
                        maxDistance: void 0 !== t.maxDistance ? t.maxDistance : 1e4,
                        panningModel: void 0 !== t.panningModel ? t.panningModel : "HRTF",
                        refDistance: void 0 !== t.refDistance ? t.refDistance : 1,
                        rolloffFactor: void 0 !== t.rolloffFactor ? t.rolloffFactor : 1
                    }, this._onstereo = t.onstereo ? [{fn: t.onstereo}] : [], this._onpos = t.onpos ? [{fn: t.onpos}] : [], this._onorientation = t.onorientation ? [{fn: t.onorientation}] : [], e.call(this, t)
                }), Howl.prototype.stereo = function (e, n) {
                    var o = this;
                    if (!o._webAudio) return o;
                    if ("loaded" !== o._state) return o._queue.push({
                        event: "stereo", action: function () {
                            o.stereo(e, n)
                        }
                    }), o;
                    var r = void 0 === Howler.ctx.createStereoPanner ? "spatial" : "stereo";
                    if (void 0 === n) {
                        if ("number" != typeof e) return o._stereo;
                        o._stereo = e, o._pos = [e, 0, 0]
                    }
                    for (var i = o._getSoundIds(n), a = 0; a < i.length; a++) {
                        var s = o._soundById(i[a]);
                        if (s) {
                            if ("number" != typeof e) return s._stereo;
                            s._stereo = e, s._pos = [e, 0, 0], s._node && (s._pannerAttr.panningModel = "equalpower", s._panner && s._panner.pan || t(s, r), "spatial" === r ? void 0 !== s._panner.positionX ? (s._panner.positionX.setValueAtTime(e, Howler.ctx.currentTime), s._panner.positionY.setValueAtTime(0, Howler.ctx.currentTime), s._panner.positionZ.setValueAtTime(0, Howler.ctx.currentTime)) : s._panner.setPosition(e, 0, 0) : s._panner.pan.setValueAtTime(e, Howler.ctx.currentTime)), o._emit("stereo", s._id)
                        }
                    }
                    return o
                }, Howl.prototype.pos = function (e, n, o, r) {
                    var i = this;
                    if (!i._webAudio) return i;
                    if ("loaded" !== i._state) return i._queue.push({
                        event: "pos", action: function () {
                            i.pos(e, n, o, r)
                        }
                    }), i;
                    if (n = "number" != typeof n ? 0 : n, o = "number" != typeof o ? -.5 : o, void 0 === r) {
                        if ("number" != typeof e) return i._pos;
                        i._pos = [e, n, o]
                    }
                    for (var a = i._getSoundIds(r), s = 0; s < a.length; s++) {
                        var u = i._soundById(a[s]);
                        if (u) {
                            if ("number" != typeof e) return u._pos;
                            u._pos = [e, n, o], u._node && (u._panner && !u._panner.pan || t(u, "spatial"), void 0 !== u._panner.positionX ? (u._panner.positionX.setValueAtTime(e, Howler.ctx.currentTime), u._panner.positionY.setValueAtTime(n, Howler.ctx.currentTime), u._panner.positionZ.setValueAtTime(o, Howler.ctx.currentTime)) : u._panner.setPosition(e, n, o)), i._emit("pos", u._id)
                        }
                    }
                    return i
                }, Howl.prototype.orientation = function (e, n, o, r) {
                    var i = this;
                    if (!i._webAudio) return i;
                    if ("loaded" !== i._state) return i._queue.push({
                        event: "orientation", action: function () {
                            i.orientation(e, n, o, r)
                        }
                    }), i;
                    if (n = "number" != typeof n ? i._orientation[1] : n, o = "number" != typeof o ? i._orientation[2] : o, void 0 === r) {
                        if ("number" != typeof e) return i._orientation;
                        i._orientation = [e, n, o]
                    }
                    for (var a = i._getSoundIds(r), s = 0; s < a.length; s++) {
                        var u = i._soundById(a[s]);
                        if (u) {
                            if ("number" != typeof e) return u._orientation;
                            u._orientation = [e, n, o], u._node && (u._panner || (u._pos || (u._pos = i._pos || [0, 0, -.5]), t(u, "spatial")), void 0 !== u._panner.orientationX ? (u._panner.orientationX.setValueAtTime(e, Howler.ctx.currentTime), u._panner.orientationY.setValueAtTime(n, Howler.ctx.currentTime), u._panner.orientationZ.setValueAtTime(o, Howler.ctx.currentTime)) : u._panner.setOrientation(e, n, o)), i._emit("orientation", u._id)
                        }
                    }
                    return i
                }, Howl.prototype.pannerAttr = function () {
                    var e, n, o, r = arguments;
                    if (!this._webAudio) return this;
                    if (0 === r.length) return this._pannerAttr;
                    if (1 === r.length) {
                        if ("object" != typeof r[0]) return (o = this._soundById(parseInt(r[0], 10))) ? o._pannerAttr : this._pannerAttr;
                        e = r[0], void 0 === n && (e.pannerAttr || (e.pannerAttr = {
                            coneInnerAngle: e.coneInnerAngle,
                            coneOuterAngle: e.coneOuterAngle,
                            coneOuterGain: e.coneOuterGain,
                            distanceModel: e.distanceModel,
                            maxDistance: e.maxDistance,
                            refDistance: e.refDistance,
                            rolloffFactor: e.rolloffFactor,
                            panningModel: e.panningModel
                        }), this._pannerAttr = {
                            coneInnerAngle: void 0 !== e.pannerAttr.coneInnerAngle ? e.pannerAttr.coneInnerAngle : this._coneInnerAngle,
                            coneOuterAngle: void 0 !== e.pannerAttr.coneOuterAngle ? e.pannerAttr.coneOuterAngle : this._coneOuterAngle,
                            coneOuterGain: void 0 !== e.pannerAttr.coneOuterGain ? e.pannerAttr.coneOuterGain : this._coneOuterGain,
                            distanceModel: void 0 !== e.pannerAttr.distanceModel ? e.pannerAttr.distanceModel : this._distanceModel,
                            maxDistance: void 0 !== e.pannerAttr.maxDistance ? e.pannerAttr.maxDistance : this._maxDistance,
                            refDistance: void 0 !== e.pannerAttr.refDistance ? e.pannerAttr.refDistance : this._refDistance,
                            rolloffFactor: void 0 !== e.pannerAttr.rolloffFactor ? e.pannerAttr.rolloffFactor : this._rolloffFactor,
                            panningModel: void 0 !== e.pannerAttr.panningModel ? e.pannerAttr.panningModel : this._panningModel
                        })
                    } else 2 === r.length && (e = r[0], n = parseInt(r[1], 10));
                    for (var i = this._getSoundIds(n), a = 0; a < i.length; a++) if (o = this._soundById(i[a])) {
                        var s = o._pannerAttr;
                        s = {
                            coneInnerAngle: void 0 !== e.coneInnerAngle ? e.coneInnerAngle : s.coneInnerAngle,
                            coneOuterAngle: void 0 !== e.coneOuterAngle ? e.coneOuterAngle : s.coneOuterAngle,
                            coneOuterGain: void 0 !== e.coneOuterGain ? e.coneOuterGain : s.coneOuterGain,
                            distanceModel: void 0 !== e.distanceModel ? e.distanceModel : s.distanceModel,
                            maxDistance: void 0 !== e.maxDistance ? e.maxDistance : s.maxDistance,
                            refDistance: void 0 !== e.refDistance ? e.refDistance : s.refDistance,
                            rolloffFactor: void 0 !== e.rolloffFactor ? e.rolloffFactor : s.rolloffFactor,
                            panningModel: void 0 !== e.panningModel ? e.panningModel : s.panningModel
                        };
                        var u = o._panner;
                        u ? (u.coneInnerAngle = s.coneInnerAngle, u.coneOuterAngle = s.coneOuterAngle, u.coneOuterGain = s.coneOuterGain, u.distanceModel = s.distanceModel, u.maxDistance = s.maxDistance, u.refDistance = s.refDistance, u.rolloffFactor = s.rolloffFactor, u.panningModel = s.panningModel) : (o._pos || (o._pos = this._pos || [0, 0, -.5]), t(o, "spatial"))
                    }
                    return this
                }, Sound.prototype.init = function (e) {
                    return function () {
                        var t = this._parent;
                        this._orientation = t._orientation, this._stereo = t._stereo, this._pos = t._pos, this._pannerAttr = t._pannerAttr, e.call(this), this._stereo ? t.stereo(this._stereo) : this._pos && t.pos(this._pos[0], this._pos[1], this._pos[2], this._id)
                    }
                }(Sound.prototype.init), Sound.prototype.reset = function (e) {
                    return function () {
                        var t = this._parent;
                        return this._orientation = t._orientation, this._stereo = t._stereo, this._pos = t._pos, this._pannerAttr = t._pannerAttr, this._stereo ? t.stereo(this._stereo) : this._pos ? t.pos(this._pos[0], this._pos[1], this._pos[2], this._id) : this._panner && (this._panner.disconnect(0), this._panner = void 0, t._refreshBuffer(this)), e.call(this)
                    }
                }(Sound.prototype.reset);
                var t = function (e, t) {
                    "spatial" === (t = t || "spatial") ? (e._panner = Howler.ctx.createPanner(), e._panner.coneInnerAngle = e._pannerAttr.coneInnerAngle, e._panner.coneOuterAngle = e._pannerAttr.coneOuterAngle, e._panner.coneOuterGain = e._pannerAttr.coneOuterGain, e._panner.distanceModel = e._pannerAttr.distanceModel, e._panner.maxDistance = e._pannerAttr.maxDistance, e._panner.refDistance = e._pannerAttr.refDistance, e._panner.rolloffFactor = e._pannerAttr.rolloffFactor, e._panner.panningModel = e._pannerAttr.panningModel, void 0 !== e._panner.positionX ? (e._panner.positionX.setValueAtTime(e._pos[0], Howler.ctx.currentTime), e._panner.positionY.setValueAtTime(e._pos[1], Howler.ctx.currentTime), e._panner.positionZ.setValueAtTime(e._pos[2], Howler.ctx.currentTime)) : e._panner.setPosition(e._pos[0], e._pos[1], e._pos[2]), void 0 !== e._panner.orientationX ? (e._panner.orientationX.setValueAtTime(e._orientation[0], Howler.ctx.currentTime), e._panner.orientationY.setValueAtTime(e._orientation[1], Howler.ctx.currentTime), e._panner.orientationZ.setValueAtTime(e._orientation[2], Howler.ctx.currentTime)) : e._panner.setOrientation(e._orientation[0], e._orientation[1], e._orientation[2])) : (e._panner = Howler.ctx.createStereoPanner(), e._panner.pan.setValueAtTime(e._stereo, Howler.ctx.currentTime)), e._panner.connect(e._node), e._paused || e._parent.pause(e._id, !0).play(e._id, !0)
                }
            }()
    }).call(this, n(2))
}, function (e, t, n) {
    var o = function (e) {
        "use strict";
        var t, n = Object.prototype, o = n.hasOwnProperty, r = "function" == typeof Symbol ? Symbol : {},
            i = r.iterator || "@@iterator", a = r.asyncIterator || "@@asyncIterator",
            s = r.toStringTag || "@@toStringTag";

        function u(e, t, n, o) {
            var r = t && t.prototype instanceof h ? t : h, i = Object.create(r.prototype), a = new I(o || []);
            return i._invoke = function (e, t, n) {
                var o = c;
                return function (r, i) {
                    if (o === _) throw new Error("Generator is already running");
                    if (o === p) {
                        if ("throw" === r) throw i;
                        return L()
                    }
                    for (n.method = r, n.arg = i; ;) {
                        var a = n.delegate;
                        if (a) {
                            var s = T(a, n);
                            if (s) {
                                if (s === f) continue;
                                return s
                            }
                        }
                        if ("next" === n.method) n.sent = n._sent = n.arg; else if ("throw" === n.method) {
                            if (o === c) throw o = p, n.arg;
                            n.dispatchException(n.arg)
                        } else "return" === n.method && n.abrupt("return", n.arg);
                        o = _;
                        var u = l(e, t, n);
                        if ("normal" === u.type) {
                            if (o = n.done ? p : d, u.arg === f) continue;
                            return {value: u.arg, done: n.done}
                        }
                        "throw" === u.type && (o = p, n.method = "throw", n.arg = u.arg)
                    }
                }
            }(e, n, a), i
        }

        function l(e, t, n) {
            try {
                return {type: "normal", arg: e.call(t, n)}
            } catch (e) {
                return {type: "throw", arg: e}
            }
        }

        e.wrap = u;
        var c = "suspendedStart", d = "suspendedYield", _ = "executing", p = "completed", f = {};

        function h() {
        }

        function m() {
        }

        function v() {
        }

        var g = {};
        g[i] = function () {
            return this
        };
        var y = Object.getPrototypeOf, w = y && y(y(P([])));
        w && w !== n && o.call(w, i) && (g = w);
        var b = v.prototype = h.prototype = Object.create(g);

        function A(e) {
            ["next", "throw", "return"].forEach(function (t) {
                e[t] = function (e) {
                    return this._invoke(t, e)
                }
            })
        }

        function x(e) {
            var t;
            this._invoke = function (n, r) {
                function i() {
                    return new Promise(function (t, i) {
                        !function t(n, r, i, a) {
                            var s = l(e[n], e, r);
                            if ("throw" !== s.type) {
                                var u = s.arg, c = u.value;
                                return c && "object" == typeof c && o.call(c, "__await") ? Promise.resolve(c.__await).then(function (e) {
                                    t("next", e, i, a)
                                }, function (e) {
                                    t("throw", e, i, a)
                                }) : Promise.resolve(c).then(function (e) {
                                    u.value = e, i(u)
                                }, function (e) {
                                    return t("throw", e, i, a)
                                })
                            }
                            a(s.arg)
                        }(n, r, t, i)
                    })
                }

                return t = t ? t.then(i, i) : i()
            }
        }

        function T(e, n) {
            var o = e.iterator[n.method];
            if (o === t) {
                if (n.delegate = null, "throw" === n.method) {
                    if (e.iterator.return && (n.method = "return", n.arg = t, T(e, n), "throw" === n.method)) return f;
                    n.method = "throw", n.arg = new TypeError("The iterator does not provide a 'throw' method")
                }
                return f
            }
            var r = l(o, e.iterator, n.arg);
            if ("throw" === r.type) return n.method = "throw", n.arg = r.arg, n.delegate = null, f;
            var i = r.arg;
            return i ? i.done ? (n[e.resultName] = i.value, n.next = e.nextLoc, "return" !== n.method && (n.method = "next", n.arg = t), n.delegate = null, f) : i : (n.method = "throw", n.arg = new TypeError("iterator result is not an object"), n.delegate = null, f)
        }

        function k(e) {
            var t = {tryLoc: e[0]};
            1 in e && (t.catchLoc = e[1]), 2 in e && (t.finallyLoc = e[2], t.afterLoc = e[3]), this.tryEntries.push(t)
        }

        function S(e) {
            var t = e.completion || {};
            t.type = "normal", delete t.arg, e.completion = t
        }

        function I(e) {
            this.tryEntries = [{tryLoc: "root"}], e.forEach(k, this), this.reset(!0)
        }

        function P(e) {
            if (e) {
                var n = e[i];
                if (n) return n.call(e);
                if ("function" == typeof e.next) return e;
                if (!isNaN(e.length)) {
                    var r = -1, a = function n() {
                        for (; ++r < e.length;) if (o.call(e, r)) return n.value = e[r], n.done = !1, n;
                        return n.value = t, n.done = !0, n
                    };
                    return a.next = a
                }
            }
            return {next: L}
        }

        function L() {
            return {value: t, done: !0}
        }

        return m.prototype = b.constructor = v, v.constructor = m, v[s] = m.displayName = "GeneratorFunction", e.isGeneratorFunction = function (e) {
            var t = "function" == typeof e && e.constructor;
            return !!t && (t === m || "GeneratorFunction" === (t.displayName || t.name))
        }, e.mark = function (e) {
            return Object.setPrototypeOf ? Object.setPrototypeOf(e, v) : (e.__proto__ = v, s in e || (e[s] = "GeneratorFunction")), e.prototype = Object.create(b), e
        }, e.awrap = function (e) {
            return {__await: e}
        }, A(x.prototype), x.prototype[a] = function () {
            return this
        }, e.AsyncIterator = x, e.async = function (t, n, o, r) {
            var i = new x(u(t, n, o, r));
            return e.isGeneratorFunction(n) ? i : i.next().then(function (e) {
                return e.done ? e.value : i.next()
            })
        }, A(b), b[s] = "Generator", b[i] = function () {
            return this
        }, b.toString = function () {
            return "[object Generator]"
        }, e.keys = function (e) {
            var t = [];
            for (var n in e) t.push(n);
            return t.reverse(), function n() {
                for (; t.length;) {
                    var o = t.pop();
                    if (o in e) return n.value = o, n.done = !1, n
                }
                return n.done = !0, n
            }
        }, e.values = P, I.prototype = {
            constructor: I, reset: function (e) {
                if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(S), !e) for (var n in this) "t" === n.charAt(0) && o.call(this, n) && !isNaN(+n.slice(1)) && (this[n] = t)
            }, stop: function () {
                this.done = !0;
                var e = this.tryEntries[0].completion;
                if ("throw" === e.type) throw e.arg;
                return this.rval
            }, dispatchException: function (e) {
                if (this.done) throw e;
                var n = this;

                function r(o, r) {
                    return s.type = "throw", s.arg = e, n.next = o, r && (n.method = "next", n.arg = t), !!r
                }

                for (var i = this.tryEntries.length - 1; i >= 0; --i) {
                    var a = this.tryEntries[i], s = a.completion;
                    if ("root" === a.tryLoc) return r("end");
                    if (a.tryLoc <= this.prev) {
                        var u = o.call(a, "catchLoc"), l = o.call(a, "finallyLoc");
                        if (u && l) {
                            if (this.prev < a.catchLoc) return r(a.catchLoc, !0);
                            if (this.prev < a.finallyLoc) return r(a.finallyLoc)
                        } else if (u) {
                            if (this.prev < a.catchLoc) return r(a.catchLoc, !0)
                        } else {
                            if (!l) throw new Error("try statement without catch or finally");
                            if (this.prev < a.finallyLoc) return r(a.finallyLoc)
                        }
                    }
                }
            }, abrupt: function (e, t) {
                for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                    var r = this.tryEntries[n];
                    if (r.tryLoc <= this.prev && o.call(r, "finallyLoc") && this.prev < r.finallyLoc) {
                        var i = r;
                        break
                    }
                }
                i && ("break" === e || "continue" === e) && i.tryLoc <= t && t <= i.finallyLoc && (i = null);
                var a = i ? i.completion : {};
                return a.type = e, a.arg = t, i ? (this.method = "next", this.next = i.finallyLoc, f) : this.complete(a)
            }, complete: function (e, t) {
                if ("throw" === e.type) throw e.arg;
                return "break" === e.type || "continue" === e.type ? this.next = e.arg : "return" === e.type ? (this.rval = this.arg = e.arg, this.method = "return", this.next = "end") : "normal" === e.type && t && (this.next = t), f
            }, finish: function (e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.finallyLoc === e) return this.complete(n.completion, n.afterLoc), S(n), f
                }
            }, catch: function (e) {
                for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                    var n = this.tryEntries[t];
                    if (n.tryLoc === e) {
                        var o = n.completion;
                        if ("throw" === o.type) {
                            var r = o.arg;
                            S(n)
                        }
                        return r
                    }
                }
                throw new Error("illegal catch attempt")
            }, delegateYield: function (e, n, o) {
                return this.delegate = {
                    iterator: P(e),
                    resultName: n,
                    nextLoc: o
                }, "next" === this.method && (this.arg = t), f
            }
        }, e
    }(e.exports);
    try {
        regeneratorRuntime = o
    } catch (e) {
        Function("r", "regeneratorRuntime = r")(o)
    }
}, function (e, t) {
    var n;
    n = function () {
        return this
    }();
    try {
        n = n || new Function("return this")()
    } catch (e) {
        "object" == typeof window && (n = window)
    }
    e.exports = n
}, function (e, t, n) {
    "use strict";
    n.r(t);
    n(1);
    var o = function () {
        var e = !(arguments.length > 0 && void 0 !== arguments[0]) || arguments[0];
        return new Promise(function (t, n) {
            if (window.Vue && t(!0), document.getElementById("vue-js")) var o = setInterval(function () {
                window.Vue && (clearInterval(o), t(!0))
            }, 100); else {
                var r = document.createElement("script");
                r.src = e ? "https://cdn.jsdelivr.net/npm/vue" : "https://cdn.jsdelivr.net/npm/vue/dist/vue.js", r.id = "vue-js", document.body.appendChild(r), r.onload = function () {
                    t(!0)
                }, r.onerror = function (e) {
                    n(e)
                }
            }
        })
    }, r = n(0);

    function i() {
        var e = document.querySelectorAll("[audio-player]");
        e.forEach(function (e) {
            e.querySelectorAll("[show-if='playing']").forEach(function (e) {
                e.setAttribute("v-if", "isPlaying")
            }), e.querySelectorAll("[hide-if='playing']").forEach(function (e) {
                e.setAttribute("v-if", "!isPlaying")
            }), e.querySelectorAll("[show-if='loop-playlist']").forEach(function (e) {
                e.setAttribute("v-if", "playlistLoop")
            }), e.querySelectorAll("[hide-if='loop-playlist']").forEach(function (e) {
                e.setAttribute("v-if", "!playlistLoop")
            }), e.querySelectorAll("[show-if='mute']").forEach(function (e) {
                e.setAttribute("v-if", "mute")
            }), e.querySelectorAll("[hide-if='mute']").forEach(function (e) {
                e.setAttribute("v-if", "!mute")
            }), e.querySelectorAll("[show-if='loop']").forEach(function (e) {
                e.setAttribute("v-if", "loop")
            }), e.querySelectorAll("[hide-if='loop']").forEach(function (e) {
                e.setAttribute("v-if", "!loop")
            }), e.querySelectorAll("[player]").forEach(function (e) {
                switch (e.getAttribute("player")) {
                    case"album-cover":
                        e.setAttribute("v-bind:src", "image"), e.removeAttribute("srcset");
                        break;
                    case"next-song":
                        e.setAttribute("v-on:click", "next");
                        break;
                    case"previous-song":
                        e.setAttribute("v-on:click", "prev");
                        break;
                    case"volume-bar":
                        e.setAttribute("v-on:click", "OnClickVolume");
                        break;
                    case"current-volume":
                        e.setAttribute("v-bind:style", "{width: percentage(volume)}");
                        break;
                    case"volume-pointer":
                        e.setAttribute("v-on:drag", "OnDragVolume"), e.setAttribute("v-bind:style", "{left: percentage(volume)}");
                        break;
                    case"seek-bar":
                        e.setAttribute("v-on:click", "OnClickSeek");
                        break;
                    case"seek-active":
                        e.setAttribute("v-bind:style", "{width: percentage(seekPercentage)}");
                        break;
                    case"seek-pointer":
                        e.setAttribute("v-on:drag", "OnDragSeek"), e.setAttribute("v-bind:style", "{left: percentage(seekPercentage)}");
                        break;
                    case"volume-mute":
                        e.setAttribute("v-on:click", "volumeMute");
                        break;
                    case"play-pause":
                        e.setAttribute("v-on:click", "paused");
                        break;
                    case"stop-song":
                        e.setAttribute("v-on:click", "stop");
                        break;
                    case"rewind":
                        e.setAttribute("v-on:click", "rewind");
                        break;
                    case"auto-next-song":
                        e.setAttribute("v-on:click", "autoNextChange");
                        break;
                    case"stop":
                        e.setAttribute("v-on:click", "stop");
                        break;
                    case"start":
                        e.setAttribute("v-on:click", "start");
                        break;
                    case"duration":
                        e.setAttribute("v-text", "formatSeconds(duration)");
                        break;
                    case"seek-value":
                        e.setAttribute("v-text", "formatSeconds(seekValue)");
                        break;
                    case"volume-down":
                        e.setAttribute("v-on:click", "volumeDown");
                        break;
                    case"volume-up":
                        e.setAttribute("v-on:click", "volumeUp");
                        break;
                    case"loop":
                        e.setAttribute("v-on:click", "onLoop");
                        break;
                    case"loop-playlist":
                        e.setAttribute("v-on:click", "onLoopPlaylist");
                        break;
                    case"song-title":
                        e.setAttribute("v-text", "title");
                        break;
                    case"album":
                        e.setAttribute("v-text", "album");
                        break;
                    case"artist":
                        e.setAttribute("v-text", "artist")
                }
            })
        });
        var t, n, o = new Vue;
        e.forEach(function (e) {
            var i = e.getAttribute("audio-player"), a = e.getAttribute("auto-play"), s = !1, u = !1;
            a && "single" == a && (s = !0), a && "playlist" == a && (u = !0), new Vue({
                el: e, data: {
                    src: i.split(",").map(function (e) {
                        return e.trim()
                    }),
                    currentSongIndex: 0,
                    howl: void 0,
                    started: !1,
                    isPlaying: !1,
                    image: "",
                    title: "",
                    album: "",
                    artist: "",
                    volume: 1,
                    mute: !1,
                    pause: !0,
                    autoNext: !0,
                    seekStatus: void 0,
                    seekValue: 0,
                    seekPercentage: 0,
                    loop: s,
                    duration: 0,
                    playlistLoop: u
                }, mounted: function () {
                    var e = this;
                    this.$el.removeAttribute("audio-player"), this.howl = new r.Howl({
                        src: this.src[this.currentSongIndex],
                        onend: function () {
                            return e.onEnd()
                        },
                        onstop: function () {
                            return e.onStopToggle()
                        },
                        onplay: function () {
                            return e.onPlayToggle()
                        },
                        onpause: function () {
                            return e.onPauseToggle()
                        },
                        onplayerror: function () {
                            return e.stop()
                        },
                        onloaderror: function () {
                            return e.stop()
                        }
                    }), o.$on("playing", function () {
                        e.isPlaying && e.stop()
                    }), this.readMetadata(this.src[this.currentSongIndex]), requestAnimationFrame(function () {
                        return e.changeSeekPercentage()
                    })
                }, methods: {
                    changeSeekPercentage: function () {
                        var e = this;
                        this.seekValue = parseInt(this.howl.seek()), this.seekPercentage = this.seekValue / this.howl.duration(), requestAnimationFrame(function () {
                            return e.changeSeekPercentage()
                        })
                    }, readMetadata: function (e) {
                        var t = this;
                        id3(e, function (e, n) {
                            if (e && console.error(e), n && (n.title && (t.title = n.title), n.album && (t.album = n.album), n.artist && (t.artist = n.artist), n.v2.image)) {
                                var o = n.v2.image.data;
                                t.image = "data:" + n.v2.image.mime + ";base64," + function (e) {
                                    for (var t = "", n = new Uint8Array(e), o = n.byteLength, r = 0; r < o; r++) t += String.fromCharCode(n[r]);
                                    return window.btoa(t)
                                }(o)
                            }
                        })
                    }, stop: function () {
                        this.howl.stop(), this.isPlaying = !1
                    }, next: function () {
                        var e = this;
                        this.stop(), this.playlistLoop ? (this.currentSongIndex = (this.currentSongIndex + 1) % this.src.length, this.howl = new r.Howl({
                            src: this.src[this.currentSongIndex],
                            preload: !0,
                            onstop: function () {
                                return e.onStopToggle()
                            },
                            onend: function () {
                                return e.onEnd()
                            },
                            onplay: function () {
                                return e.onPlayToggle()
                            },
                            onpause: function () {
                                return e.onPauseToggle()
                            },
                            onplayerror: function () {
                                return e.stop()
                            },
                            onloaderror: function () {
                                return e.stop()
                            }
                        }), this.howl.play()) : this.currentSongIndex < this.src.length - 1 && (this.currentSongIndex = this.currentSongIndex + 1, this.howl = new r.Howl({
                            src: this.src[this.currentSongIndex],
                            preload: !0,
                            onstop: function () {
                                return e.onStopToggle()
                            },
                            onend: function () {
                                return e.onEnd()
                            },
                            onplay: function () {
                                return e.onPlayToggle()
                            },
                            onpause: function () {
                                return e.onPauseToggle()
                            },
                            onplayerror: function () {
                                return e.stop()
                            },
                            onloaderror: function () {
                                return e.stop()
                            }
                        }), this.howl.play()), this.readMetadata(this.src[this.currentSongIndex])
                    }, prev: function () {
                        var e = this;
                        this.stop(), this.currentSongIndex = 0 == this.currentSongIndex ? this.src.length - 1 : this.currentSongIndex - 1, this.howl = new r.Howl({
                            src: this.src[this.currentSongIndex],
                            preload: !0,
                            onstop: function () {
                                return e.onStopToggle()
                            },
                            onplay: function () {
                                return e.onPlayToggle()
                            },
                            onpause: function () {
                                return e.onPauseToggle()
                            },
                            onend: function () {
                                return e.onEnd()
                            },
                            onplayerror: function () {
                                return e.stop()
                            },
                            onloaderror: function () {
                                return e.stop()
                            }
                        }), this.howl.play(), this.readMetadata(this.src[this.currentSongIndex])
                    }, volumeChange: function () {
                        this.howl.volume(this.volume), this.mute = !1
                    }, volumeMute: function () {
                        this.mute = !this.mute, this.mute ? this.howl.volume(0) : this.howl.volume(this.volume)
                    }, paused: function () {
                        this.pause ? this.howl.play() : this.howl.pause()
                    }, percentage: function (e) {
                        return 100 * e + "%"
                    }, rewind: function () {
                        this.stop(), this.isPlaying ? this.isPlaying : this.isPlaying = !0, this.howl.play()
                    }, onEnd: function () {
                        this.seekPercentage = 1, this.seekValue = this.howl.duration(), this.loop ? this.rewind() : this.autoNext ? this.next() : this.stop()
                    }, volumeController: function (e) {
                        dragElement(e)
                    }, autoNextChange: function () {
                        this.autoNext = !this.autoNext
                    }, OnDragVolume: function (e) {
                        var n = (e = e || window.event).target;
                        e.preventDefault();
                        var o = e.clientX, r = n.closest('[player="volume-bar"]').getBoundingClientRect().width,
                            i = (o -= n.getBoundingClientRect().left) * (100 / r);
                        i = i >= 100 ? 1 : i / 100, t ? Math.abs(i - t) < .1 && (this.volume = i, t = i) : (this.volume = i, t = i), this.mute = 0 == this.volume
                    }, OnClickVolume: function (e) {
                        var t = (e = e || window.event).target;
                        e.preventDefault();
                        var n = e.clientX, o = t.closest('[player="volume-bar"]').getBoundingClientRect().width,
                            r = (n -= t.getBoundingClientRect().left) * (100 / o);
                        r = r >= 100 ? 1 : r / 100, this.volume = r, this.howl.volume(this.volume), this.mute = 0 == this.volume
                    }, OnDragSeek: function (e) {
                        var t = (e = e || window.event).target;
                        e.preventDefault();
                        var o = e.clientX, r = t.closest('[player="seek-bar"]').getBoundingClientRect().width,
                            i = (o -= t.getBoundingClientRect().left) * (100 / r);
                        i = i >= 100 ? 100 : i, i = this.howl.duration() / 100 * i, n ? Math.abs(i - n) < 10 && (this.seekChange(i), n = i) : (this.seekChange(i), n = i)
                    }, OnClickSeek: function (e) {
                        var t = (e = e || window.event).target;
                        e.preventDefault();
                        var n = e.clientX, o = t.closest('[player="seek-bar"]').getBoundingClientRect().width,
                            r = (n -= t.getBoundingClientRect().left) * (100 / o);
                        r = r >= 100 ? 100 : r, r = this.howl.duration() / 100 * r, this.seekChange(r)
                    }, seekChange: function (e) {
                        this.howl.seek(e)
                    }, formatSeconds: function (e) {
                        var t = Math.round(e % 60), n = Math.floor(e / 60);
                        return "".concat(n, ":").concat((t + "").padStart(2, "0"))
                    }, volumeDown: function () {
                        this.volume > 0 && (this.volume >= .1 ? this.volume = this.volume - .1 : this.volume = 0), this.howl.volume(this.volume), this.mute = !1
                    }, volumeUp: function () {
                        this.volume >= 0 && (this.volume <= .9 ? this.volume = this.volume + .1 : this.volume = 1), this.howl.volume(this.volume), this.mute = !1
                    }, onLoop: function () {
                        this.loop = !this.loop
                    }, onLoopPlaylist: function () {
                        0 == this.playlistLoop && 0 == this.loop ? (this.playlistLoop = !0, this.loop = !1) : 1 == this.playlistLoop && 0 == this.loop ? (this.loop = !0, this.playlistLoop = !0) : (this.loop = !1, this.playlistLoop = !1)
                    }, onPlayToggle: function () {
                        o.$emit("playing"), this.pause = !1, this.isPlaying = !0, this.duration = this.howl.duration(), this.changeSeekPercentage()
                    }, onPauseToggle: function () {
                        this.pause = !0, this.isPlaying = !1
                    }, onStopToggle: function () {
                        this.onPauseToggle()
                    }
                }
            })
        })
    }

    function a(e, t, n, o, r, i, a) {
        try {
            var s = e[i](a), u = s.value
        } catch (e) {
            return void n(e)
        }
        s.done ? t(u) : Promise.resolve(u).then(o, r)
    }

    function s() {
        var e;
        return e = regeneratorRuntime.mark(function e() {
            return regeneratorRuntime.wrap(function (e) {
                for (; ;) switch (e.prev = e.next) {
                    case 0:
                        return e.next = 2, o();
                    case 2:
                        if (e.sent) {
                            e.next = 5;
                            break
                        }
                        return e.abrupt("return");
                    case 5:
                        i();
                    case 6:
                    case"end":
                        return e.stop()
                }
            }, e)
        }), (s = function () {
            var t = this, n = arguments;
            return new Promise(function (o, r) {
                var i = e.apply(t, n);

                function s(e) {
                    a(i, o, r, s, u, "next", e)
                }

                function u(e) {
                    a(i, o, r, s, u, "throw", e)
                }

                s(void 0)
            })
        }).apply(this, arguments)
    }

    !function () {
        s.apply(this, arguments)
    }()
}]);