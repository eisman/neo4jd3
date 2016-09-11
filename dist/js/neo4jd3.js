(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Neo4jd3 = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
'use strict';

var neo4jd3 = _dereq_('./scripts/neo4jd3');

module.exports = neo4jd3;

},{"./scripts/neo4jd3":2}],2:[function(_dereq_,module,exports){
/* global d3, document */
/* jshint latedef:nofunc */
'use strict';

function Neo4jD3(_selector, _options){
    var container, info, selector, simulation, svg, svgScale, svgTranslate,
        classes2Colors = {},
        justLoaded = false,
        numClasses = 0,
        options = {
            arrowSize: 4,
//            colors: d3.schemeCategory10,
//            colors: d3.schemeCategory20,
            colors: [
                '#68bdf6', // light blue
                '#6dce9e', // green #1
                '#faafc2', // light pink
                '#f2baf6', // purple
                '#ff928c', // light red
                '#fcea7e', // light yellow
                '#ffc766', // light orange
                '#405f9e', // navy blue
                '#a5abb6', // dark gray
                '#78cecb', // green #2,
                '#b88cbb', // dark purple
                '#ced2d9', // light gray
                '#e84646', // dark red
                '#fa5f86', // dark pink
                '#ffab1a', // dark orange
                '#fcda19', // dark yellow
                '#797b80', // black
                '#c9d96f', // pistacchio
                '#47991f', // green #3
                '#70edee', // turquoise
                '#ff75ea'  // pink
            ],
            iconMap: {'glass':'f000','music':'f001','search':'f002','envelope-o':'f003','heart':'f004','star':'f005','star-o':'f006','user':'f007','film':'f008','th-large':'f009','th':'f00a','th-list':'f00b','check':'f00c','remove,close,times':'f00d','search-plus':'f00e','search-minus':'f010','power-off':'f011','signal':'f012','gear,cog':'f013','trash-o':'f014','home':'f015','file-o':'f016','clock-o':'f017','road':'f018','download':'f019','arrow-circle-o-down':'f01a','arrow-circle-o-up':'f01b','inbox':'f01c','play-circle-o':'f01d','rotate-right,repeat':'f01e','refresh':'f021','list-alt':'f022','lock':'f023','flag':'f024','headphones':'f025','volume-off':'f026','volume-down':'f027','volume-up':'f028','qrcode':'f029','barcode':'f02a','tag':'f02b','tags':'f02c','book':'f02d','bookmark':'f02e','print':'f02f','camera':'f030','font':'f031','bold':'f032','italic':'f033','text-height':'f034','text-width':'f035','align-left':'f036','align-center':'f037','align-right':'f038','align-justify':'f039','list':'f03a','dedent,outdent':'f03b','indent':'f03c','video-camera':'f03d','photo,image,picture-o':'f03e','pencil':'f040','map-marker':'f041','adjust':'f042','tint':'f043','edit,pencil-square-o':'f044','share-square-o':'f045','check-square-o':'f046','arrows':'f047','step-backward':'f048','fast-backward':'f049','backward':'f04a','play':'f04b','pause':'f04c','stop':'f04d','forward':'f04e','fast-forward':'f050','step-forward':'f051','eject':'f052','chevron-left':'f053','chevron-right':'f054','plus-circle':'f055','minus-circle':'f056','times-circle':'f057','check-circle':'f058','question-circle':'f059','info-circle':'f05a','crosshairs':'f05b','times-circle-o':'f05c','check-circle-o':'f05d','ban':'f05e','arrow-left':'f060','arrow-right':'f061','arrow-up':'f062','arrow-down':'f063','mail-forward,share':'f064','expand':'f065','compress':'f066','plus':'f067','minus':'f068','asterisk':'f069','exclamation-circle':'f06a','gift':'f06b','leaf':'f06c','fire':'f06d','eye':'f06e','eye-slash':'f070','warning,exclamation-triangle':'f071','plane':'f072','calendar':'f073','random':'f074','comment':'f075','magnet':'f076','chevron-up':'f077','chevron-down':'f078','retweet':'f079','shopping-cart':'f07a','folder':'f07b','folder-open':'f07c','arrows-v':'f07d','arrows-h':'f07e','bar-chart-o,bar-chart':'f080','twitter-square':'f081','facebook-square':'f082','camera-retro':'f083','key':'f084','gears,cogs':'f085','comments':'f086','thumbs-o-up':'f087','thumbs-o-down':'f088','star-half':'f089','heart-o':'f08a','sign-out':'f08b','linkedin-square':'f08c','thumb-tack':'f08d','external-link':'f08e','sign-in':'f090','trophy':'f091','github-square':'f092','upload':'f093','lemon-o':'f094','phone':'f095','square-o':'f096','bookmark-o':'f097','phone-square':'f098','twitter':'f099','facebook-f,facebook':'f09a','github':'f09b','unlock':'f09c','credit-card':'f09d','feed,rss':'f09e','hdd-o':'f0a0','bullhorn':'f0a1','bell':'f0f3','certificate':'f0a3','hand-o-right':'f0a4','hand-o-left':'f0a5','hand-o-up':'f0a6','hand-o-down':'f0a7','arrow-circle-left':'f0a8','arrow-circle-right':'f0a9','arrow-circle-up':'f0aa','arrow-circle-down':'f0ab','globe':'f0ac','wrench':'f0ad','tasks':'f0ae','filter':'f0b0','briefcase':'f0b1','arrows-alt':'f0b2','group,users':'f0c0','chain,link':'f0c1','cloud':'f0c2','flask':'f0c3','cut,scissors':'f0c4','copy,files-o':'f0c5','paperclip':'f0c6','save,floppy-o':'f0c7','square':'f0c8','navicon,reorder,bars':'f0c9','list-ul':'f0ca','list-ol':'f0cb','strikethrough':'f0cc','underline':'f0cd','table':'f0ce','magic':'f0d0','truck':'f0d1','pinterest':'f0d2','pinterest-square':'f0d3','google-plus-square':'f0d4','google-plus':'f0d5','money':'f0d6','caret-down':'f0d7','caret-up':'f0d8','caret-left':'f0d9','caret-right':'f0da','columns':'f0db','unsorted,sort':'f0dc','sort-down,sort-desc':'f0dd','sort-up,sort-asc':'f0de','envelope':'f0e0','linkedin':'f0e1','rotate-left,undo':'f0e2','legal,gavel':'f0e3','dashboard,tachometer':'f0e4','comment-o':'f0e5','comments-o':'f0e6','flash,bolt':'f0e7','sitemap':'f0e8','umbrella':'f0e9','paste,clipboard':'f0ea','lightbulb-o':'f0eb','exchange':'f0ec','cloud-download':'f0ed','cloud-upload':'f0ee','user-md':'f0f0','stethoscope':'f0f1','suitcase':'f0f2','bell-o':'f0a2','coffee':'f0f4','cutlery':'f0f5','file-text-o':'f0f6','building-o':'f0f7','hospital-o':'f0f8','ambulance':'f0f9','medkit':'f0fa','fighter-jet':'f0fb','beer':'f0fc','h-square':'f0fd','plus-square':'f0fe','angle-double-left':'f100','angle-double-right':'f101','angle-double-up':'f102','angle-double-down':'f103','angle-left':'f104','angle-right':'f105','angle-up':'f106','angle-down':'f107','desktop':'f108','laptop':'f109','tablet':'f10a','mobile-phone,mobile':'f10b','circle-o':'f10c','quote-left':'f10d','quote-right':'f10e','spinner':'f110','circle':'f111','mail-reply,reply':'f112','github-alt':'f113','folder-o':'f114','folder-open-o':'f115','smile-o':'f118','frown-o':'f119','meh-o':'f11a','gamepad':'f11b','keyboard-o':'f11c','flag-o':'f11d','flag-checkered':'f11e','terminal':'f120','code':'f121','mail-reply-all,reply-all':'f122','star-half-empty,star-half-full,star-half-o':'f123','location-arrow':'f124','crop':'f125','code-fork':'f126','unlink,chain-broken':'f127','question':'f128','info':'f129','exclamation':'f12a','superscript':'f12b','subscript':'f12c','eraser':'f12d','puzzle-piece':'f12e','microphone':'f130','microphone-slash':'f131','shield':'f132','calendar-o':'f133','fire-extinguisher':'f134','rocket':'f135','maxcdn':'f136','chevron-circle-left':'f137','chevron-circle-right':'f138','chevron-circle-up':'f139','chevron-circle-down':'f13a','html5':'f13b','css3':'f13c','anchor':'f13d','unlock-alt':'f13e','bullseye':'f140','ellipsis-h':'f141','ellipsis-v':'f142','rss-square':'f143','play-circle':'f144','ticket':'f145','minus-square':'f146','minus-square-o':'f147','level-up':'f148','level-down':'f149','check-square':'f14a','pencil-square':'f14b','external-link-square':'f14c','share-square':'f14d','compass':'f14e','toggle-down,caret-square-o-down':'f150','toggle-up,caret-square-o-up':'f151','toggle-right,caret-square-o-right':'f152','euro,eur':'f153','gbp':'f154','dollar,usd':'f155','rupee,inr':'f156','cny,rmb,yen,jpy':'f157','ruble,rouble,rub':'f158','won,krw':'f159','bitcoin,btc':'f15a','file':'f15b','file-text':'f15c','sort-alpha-asc':'f15d','sort-alpha-desc':'f15e','sort-amount-asc':'f160','sort-amount-desc':'f161','sort-numeric-asc':'f162','sort-numeric-desc':'f163','thumbs-up':'f164','thumbs-down':'f165','youtube-square':'f166','youtube':'f167','xing':'f168','xing-square':'f169','youtube-play':'f16a','dropbox':'f16b','stack-overflow':'f16c','instagram':'f16d','flickr':'f16e','adn':'f170','bitbucket':'f171','bitbucket-square':'f172','tumblr':'f173','tumblr-square':'f174','long-arrow-down':'f175','long-arrow-up':'f176','long-arrow-left':'f177','long-arrow-right':'f178','apple':'f179','windows':'f17a','android':'f17b','linux':'f17c','dribbble':'f17d','skype':'f17e','foursquare':'f180','trello':'f181','female':'f182','male':'f183','gittip,gratipay':'f184','sun-o':'f185','moon-o':'f186','archive':'f187','bug':'f188','vk':'f189','weibo':'f18a','renren':'f18b','pagelines':'f18c','stack-exchange':'f18d','arrow-circle-o-right':'f18e','arrow-circle-o-left':'f190','toggle-left,caret-square-o-left':'f191','dot-circle-o':'f192','wheelchair':'f193','vimeo-square':'f194','turkish-lira,try':'f195','plus-square-o':'f196','space-shuttle':'f197','slack':'f198','envelope-square':'f199','wordpress':'f19a','openid':'f19b','institution,bank,university':'f19c','mortar-board,graduation-cap':'f19d','yahoo':'f19e','google':'f1a0','reddit':'f1a1','reddit-square':'f1a2','stumbleupon-circle':'f1a3','stumbleupon':'f1a4','delicious':'f1a5','digg':'f1a6','pied-piper-pp':'f1a7','pied-piper-alt':'f1a8','drupal':'f1a9','joomla':'f1aa','language':'f1ab','fax':'f1ac','building':'f1ad','child':'f1ae','paw':'f1b0','spoon':'f1b1','cube':'f1b2','cubes':'f1b3','behance':'f1b4','behance-square':'f1b5','steam':'f1b6','steam-square':'f1b7','recycle':'f1b8','automobile,car':'f1b9','cab,taxi':'f1ba','tree':'f1bb','spotify':'f1bc','deviantart':'f1bd','soundcloud':'f1be','database':'f1c0','file-pdf-o':'f1c1','file-word-o':'f1c2','file-excel-o':'f1c3','file-powerpoint-o':'f1c4','file-photo-o,file-picture-o,file-image-o':'f1c5','file-zip-o,file-archive-o':'f1c6','file-sound-o,file-audio-o':'f1c7','file-movie-o,file-video-o':'f1c8','file-code-o':'f1c9','vine':'f1ca','codepen':'f1cb','jsfiddle':'f1cc','life-bouy,life-buoy,life-saver,support,life-ring':'f1cd','circle-o-notch':'f1ce','ra,resistance,rebel':'f1d0','ge,empire':'f1d1','git-square':'f1d2','git':'f1d3','y-combinator-square,yc-square,hacker-news':'f1d4','tencent-weibo':'f1d5','qq':'f1d6','wechat,weixin':'f1d7','send,paper-plane':'f1d8','send-o,paper-plane-o':'f1d9','history':'f1da','circle-thin':'f1db','header':'f1dc','paragraph':'f1dd','sliders':'f1de','share-alt':'f1e0','share-alt-square':'f1e1','bomb':'f1e2','soccer-ball-o,futbol-o':'f1e3','tty':'f1e4','binoculars':'f1e5','plug':'f1e6','slideshare':'f1e7','twitch':'f1e8','yelp':'f1e9','newspaper-o':'f1ea','wifi':'f1eb','calculator':'f1ec','paypal':'f1ed','google-wallet':'f1ee','cc-visa':'f1f0','cc-mastercard':'f1f1','cc-discover':'f1f2','cc-amex':'f1f3','cc-paypal':'f1f4','cc-stripe':'f1f5','bell-slash':'f1f6','bell-slash-o':'f1f7','trash':'f1f8','copyright':'f1f9','at':'f1fa','eyedropper':'f1fb','paint-brush':'f1fc','birthday-cake':'f1fd','area-chart':'f1fe','pie-chart':'f200','line-chart':'f201','lastfm':'f202','lastfm-square':'f203','toggle-off':'f204','toggle-on':'f205','bicycle':'f206','bus':'f207','ioxhost':'f208','angellist':'f209','cc':'f20a','shekel,sheqel,ils':'f20b','meanpath':'f20c','buysellads':'f20d','connectdevelop':'f20e','dashcube':'f210','forumbee':'f211','leanpub':'f212','sellsy':'f213','shirtsinbulk':'f214','simplybuilt':'f215','skyatlas':'f216','cart-plus':'f217','cart-arrow-down':'f218','diamond':'f219','ship':'f21a','user-secret':'f21b','motorcycle':'f21c','street-view':'f21d','heartbeat':'f21e','venus':'f221','mars':'f222','mercury':'f223','intersex,transgender':'f224','transgender-alt':'f225','venus-double':'f226','mars-double':'f227','venus-mars':'f228','mars-stroke':'f229','mars-stroke-v':'f22a','mars-stroke-h':'f22b','neuter':'f22c','genderless':'f22d','facebook-official':'f230','pinterest-p':'f231','whatsapp':'f232','server':'f233','user-plus':'f234','user-times':'f235','hotel,bed':'f236','viacoin':'f237','train':'f238','subway':'f239','medium':'f23a','yc,y-combinator':'f23b','optin-monster':'f23c','opencart':'f23d','expeditedssl':'f23e','battery-4,battery-full':'f240','battery-3,battery-three-quarters':'f241','battery-2,battery-half':'f242','battery-1,battery-quarter':'f243','battery-0,battery-empty':'f244','mouse-pointer':'f245','i-cursor':'f246','object-group':'f247','object-ungroup':'f248','sticky-note':'f249','sticky-note-o':'f24a','cc-jcb':'f24b','cc-diners-club':'f24c','clone':'f24d','balance-scale':'f24e','hourglass-o':'f250','hourglass-1,hourglass-start':'f251','hourglass-2,hourglass-half':'f252','hourglass-3,hourglass-end':'f253','hourglass':'f254','hand-grab-o,hand-rock-o':'f255','hand-stop-o,hand-paper-o':'f256','hand-scissors-o':'f257','hand-lizard-o':'f258','hand-spock-o':'f259','hand-pointer-o':'f25a','hand-peace-o':'f25b','trademark':'f25c','registered':'f25d','creative-commons':'f25e','gg':'f260','gg-circle':'f261','tripadvisor':'f262','odnoklassniki':'f263','odnoklassniki-square':'f264','get-pocket':'f265','wikipedia-w':'f266','safari':'f267','chrome':'f268','firefox':'f269','opera':'f26a','internet-explorer':'f26b','tv,television':'f26c','contao':'f26d','500px':'f26e','amazon':'f270','calendar-plus-o':'f271','calendar-minus-o':'f272','calendar-times-o':'f273','calendar-check-o':'f274','industry':'f275','map-pin':'f276','map-signs':'f277','map-o':'f278','map':'f279','commenting':'f27a','commenting-o':'f27b','houzz':'f27c','vimeo':'f27d','black-tie':'f27e','fonticons':'f280','reddit-alien':'f281','edge':'f282','credit-card-alt':'f283','codiepie':'f284','modx':'f285','fort-awesome':'f286','usb':'f287','product-hunt':'f288','mixcloud':'f289','scribd':'f28a','pause-circle':'f28b','pause-circle-o':'f28c','stop-circle':'f28d','stop-circle-o':'f28e','shopping-bag':'f290','shopping-basket':'f291','hashtag':'f292','bluetooth':'f293','bluetooth-b':'f294','percent':'f295','gitlab':'f296','wpbeginner':'f297','wpforms':'f298','envira':'f299','universal-access':'f29a','wheelchair-alt':'f29b','question-circle-o':'f29c','blind':'f29d','audio-description':'f29e','volume-control-phone':'f2a0','braille':'f2a1','assistive-listening-systems':'f2a2','asl-interpreting,american-sign-language-interpreting':'f2a3','deafness,hard-of-hearing,deaf':'f2a4','glide':'f2a5','glide-g':'f2a6','signing,sign-language':'f2a7','low-vision':'f2a8','viadeo':'f2a9','viadeo-square':'f2aa','snapchat':'f2ab','snapchat-ghost':'f2ac','snapchat-square':'f2ad','pied-piper':'f2ae','first-order':'f2b0','yoast':'f2b1','themeisle':'f2b2','google-plus-circle,google-plus-official':'f2b3','fa,font-awesome':'f2b4'},
            icons: undefined,
            infoPanel: true,
            minCollision: undefined,
            nodeRadius: 25,
            relationshipColor: '#a5abb6',
            showIcons: false,
            zoomFit: false
        },
        version = '0.0.1';

    function appendGraph(container) {
        var svg = container.append('svg')
                           .attr('width', '100%')
                           .attr('height', '100%')
                           .attr('class', 'neo4jd3-graph')
                           .call(d3.zoom().on('zoom', function() {
                               var scale = d3.event.transform.k,
                                   translate = [d3.event.transform.x, d3.event.transform.y];

                               if (svgTranslate) {
                                   translate[0] += svgTranslate[0];
                                   translate[1] += svgTranslate[1];
                               }

                               if (svgScale) {
                                   scale *= svgScale;
                               }

                               svg.attr('transform', 'translate(' + translate[0] + ', ' + translate[1] + ') scale(' + scale + ')');
                           }))
                           .on('dblclick.zoom', null)
                           .append('g')
                           .attr('width', '100%')
                           .attr('height', '100%');

        return svg;
    }

    function appendInfo(container) {
        return container.append('div')
                        .attr('class', 'neo4jd3-info ' + options.infoPosition);
    }

    function appendInfoElement(cls, isNode, property, value) {
        var elem = info.append('a');

        elem.attr('href', '#')
            .attr('class', 'btn ' + cls + ' disabled')
            .attr('role', 'button')
            .html('<strong>' + property + '</strong>' + (value ? (': ' + value) : ''));

        if (!value) {
            elem.style('background-color', function(d) {
                return isNode ? class2color(property) : defaultColor();
            })
            .style('border-color', function(d) {
                return isNode ? class2darkenColor(property) : defaultDarkenColor();
            });
        }
    }

    function appendInfoElementNode(cls, node) {
        appendInfoElement(cls, true, node);
    }

    function appendInfoElementProperty(cls, property, value) {
        appendInfoElement(cls, false, property, value);
    }

    function appendInfoElementRelationship(cls, relationship) {
        appendInfoElement(cls, false, relationship);
    }

    function appendNodes(svg, graphNodes) {
        return svg.append('g')
                  .attr('class', 'nodes')
                  .selectAll('circle')
                  .data(graphNodes)
                  .enter().append('g')
                  .attr('class', function(d) {
                      return 'node';
                  })
                  .on('dblclick', function(d) {
                      if (typeof options.onNodeDoubleClick === 'function') {
                          options.onNodeDoubleClick(d);
                      }
                  })
                  .on('mouseenter', function(d) {
                      if (info) {
                          updateInfo(d);
                      }
                  })
                  .on('mouseleave', function(d) {
                      if (info) {
                          clearInfo(d);
                      }
                  })
                  .call(d3.drag()
                          .on('start', dragStarted)
                          .on('drag', dragged)
                          .on('end', dragEnded));
    }

    function appendNodesOutlines(nodes) {
        nodes.append('circle')
             .attr('class', 'outline')
             .attr('r', options.nodeRadius)
             .style('fill', function(d) {
                 return class2color(d.labels[0]);
             })
             .style('stroke', function(d) {
                 return class2darkenColor(d.labels[0]);
             })
             .append('title').text(function(d) {
                 return toString(d);
             });
    }

    function appendNodesRings(nodes) {
        nodes.append('circle')
             .attr('class', 'ring')
             .attr('r', options.nodeRadius * 1.16)
             .append('title').text(function(d) {
                 return toString(d);
             });
    }

    function appendNodesTexts(nodes) {
        nodes.append('text')
             .attr('class', function(d) {
                 return 'node-text' + (iconCode(d) ? ' node-icon' : '');
             })
             .attr('fill', '#ffffff')
             .attr('font-size', function(d) {
                 return iconCode(d) ? (options.nodeRadius + 'px') : '10px';
             })
             .attr('pointer-events', 'none')
             .attr('text-anchor', 'middle')
             .attr('y', function(d) {
                 return iconCode(d) ? (parseInt(Math.round(options.nodeRadius * 0.32)) + 'px') : '4px';
             })
             .html(function(d) {
                 var icon = iconCode(d);
                 return icon ? '&#x' + icon : d.id;
             });
    }

    function appendNodesToGraph(svg, graphNodes) {
        var nodes = appendNodes(svg, graphNodes);

        appendNodesRings(nodes);
        appendNodesOutlines(nodes);
        appendNodesTexts(nodes);

        return nodes;
    }

    function appendRelationships(svg, graphRelationships) {
        return svg.append('g')
                  .attr('class', 'relationships')
                  .selectAll('line')
                  .data(graphRelationships)
                  .enter().append('g')
                  .attr('class', 'relationship')
                  .on('dblclick', function(d) {
                      if (typeof options.onRelationshipDoubleClick === 'function') {
                          options.onRelationshipDoubleClick(d);
                      }
                  })
                  .on('mouseenter', function(d) {
                      if (info) {
                          updateInfo(d);
                      }
                  });
    }

    function appendRelationshipsOutlines(relationships) {
        return relationships.append('path')
                            .attr('class', 'outline')
                            .attr('fill', '#a5abb6')
                            .attr('stroke', 'none');
    }

    function appendRelationshipsOverlays(relationships) {
        return relationships.append('path')
                            .attr('class', 'overlay');
    }

    function appendRelationshipsTexts(relationships) {
        return relationships.append('text')
                            .attr('class', 'text')
                            .attr('fill', '#000000')
                            .attr('font-size', '8px')
                            .attr('pointer-events', 'none')
                            .attr('text-anchor', 'middle')
                            .text(function(d) {
                                return d.type;
                            });
    }

    function appendRelationshipsToGraph(svg, graphRelationships) {
        var relationships = appendRelationships(svg, graphRelationships),
            texts = appendRelationshipsTexts(relationships),
            outlines = appendRelationshipsOutlines(relationships),
            overlays = appendRelationshipsOverlays(relationships);

        return {
            outlines: outlines,
            overlays: overlays,
            relationships: relationships,
            texts: texts
        };
    }

    function class2color(cls) {
        var color = classes2Colors[cls];

        if (!color) {
//            color = options.colors[Math.min(numClasses, options.colors.length - 1)];
            color = options.colors[numClasses % options.colors.length];
            classes2Colors[cls] = color;
            numClasses++;
        }

        return color;
    }

    function class2darkenColor(cls) {
        return d3.rgb(class2color(cls)).darker(1);
    }

    function clearInfo() {
        info.html('');
    }

    function contains(array, id) {
        var filter = array.filter(function(elem) {
            return elem.id === id;
        });

        return filter.length > 0;
    }

    function data2graph(data) {
        var graph = {
            nodes: [],
            relationships: []
        };

        data.results.forEach(function(result) {
            result.data.forEach(function(data) {
                data.graph.nodes.forEach(function(node) {
                    if (!contains(graph.nodes, node.id)) {
                        graph.nodes.push(node);
                    }
                });

                data.graph.relationships.forEach(function(relationship) {
                    relationship.source = relationship.startNode;
                    relationship.target = relationship.endNode;
                    graph.relationships.push(relationship);
                });

                data.graph.relationships.sort(function(a, b) {
                    if (a.source > b.source) {
                        return 1;
                    } else if (a.source < b.source) {
                        return -1;
                    } else {
                        if (a.target > b.target) {
                            return 1;
                        }

                        if (a.target < b.target) {
                            return -1;
                        } else {
                            return 0;
                        }
                    }
                });

                for (var i = 0; i < data.graph.relationships.length; i++) {
                    if (i !== 0 && data.graph.relationships[i].source === data.graph.relationships[i-1].source && data.graph.relationships[i].target === data.graph.relationships[i-1].target) {
                        data.graph.relationships[i].linknum = data.graph.relationships[i - 1].linknum + 1;
                    } else {
                        data.graph.relationships[i].linknum = 1;
                    }
                }
            });
        });

        return graph;
    }

    function defaultColor() {
        return options.relationshipColor;
    }

    function defaultDarkenColor() {
        return d3.rgb(options.colors[options.colors.length - 1]).darker(1);
    }

    function dragEnded(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0);
        }

        d.fx = d.fy = null;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }

    function dragStarted(d) {
        if (!d3.event.active) {
            simulation.alphaTarget(0.3).restart();
        }

        d.fx = d.x;
        d.fy = d.y;
    }

    function extend(obj1, obj2) {
        var obj = {};

        merge(obj, obj1);
        merge(obj, obj2);

        return obj;
    }

    function iconCode(d) {
        var code;

        if (options.iconMap && options.showIcons && options.icons && options.icons[[d.labels[0]]] && options.iconMap[options.icons[d.labels[0]]]) {
            code = options.iconMap[options.icons[d.labels[0]]];
        }

        return code;
    }

    // TODO
    function icons(showIcons) {
        if (showIcons !== undefined) {
            options.showIcons = showIcons;
        }

        return options.showIcons;
    }

    function init(_selector, _options) {
        Object.keys(options.iconMap).forEach(function(key, index) {
            var keys = key.split(','),
                value = options.iconMap[key];
            keys.forEach(function(key) {
                options.iconMap[key] = value;
            });
        });

        merge(options, _options);

        if (options.icons) {
            options.showIcons = true;
        }

        if (!options.minCollision) {
            options.minCollision = options.nodeRadius * 2;
        }

        selector = _selector;

        container = d3.select(selector);

        container.attr('class', 'neo4jd3')
                 .html('');

        if (options.infoPanel) {
            info = appendInfo(container);
        }

        svg = appendGraph(container);

        simulation = initSimulation();

        loadData();
    }

    function initSimulation() {
        var simulation = d3.forceSimulation()
//                           .velocityDecay(0.8)
//                           .force('x', d3.force().strength(0.002))
//                           .force('y', d3.force().strength(0.002))
                           .force('collide', d3.forceCollide().radius(function(d) {
                               return options.minCollision;
                           }).iterations(2))
                           .force('charge', d3.forceManyBody())
                           .force('link', d3.forceLink().id(function(d) {
                               return d.id;
                           }))
                           .force('center', d3.forceCenter(svg.node().parentElement.parentElement.clientWidth / 2, svg.node().parentElement.parentElement.clientHeight / 2));

        return simulation;
    }

    function loadData() {
        d3.json(options.dataUrl, function(error, data) {
            if (error) {
                throw error;
            }

            var graph = data2graph(data),
                relationships = appendRelationshipsToGraph(svg, graph.relationships),
                nodes = appendNodesToGraph(svg, graph.nodes);

            simulation.nodes(graph.nodes).on('tick', function() {
                tick(nodes, relationships);
            }).on('end', function (){
                if (options.zoomFit && !justLoaded) {
                    justLoaded = true;
                    zoomFit(2);
                }
            });

            simulation.force('link').links(graph.relationships);
        });
    }

    function merge(target, source) {
        Object.keys(source).forEach(function(property) {
            target[property] = source[property];
        });
    }

    function rotate(cx, cy, x, y, angle) {
        var radians = (Math.PI / 180) * angle,
            cos = Math.cos(radians),
            sin = Math.sin(radians),
            nx = (cos * (x - cx)) + (sin * (y - cy)) + cx,
            ny = (cos * (y - cy)) - (sin * (x - cx)) + cy;

        return { x: nx, y: ny };
    }

    function rotatePoint(c, p, angle) {
        return rotate(c.x, c.y, p.x, p.y, angle);
    }

    function rotation(source, target) {
        return Math.atan2(target.y - source.y, target.x - source.x) * 180 / Math.PI;
    }
/*
    function smoothTransform(elem, translate, scale) {
        var animationMilliseconds = 5000,
            timeoutMilliseconds = 50,
            steps = parseInt(animationMilliseconds / timeoutMilliseconds);

        setTimeout(function() {
            smoothTransformStep(elem, translate, scale, timeoutMilliseconds, 1, steps);
        }, timeoutMilliseconds);
    }

    function smoothTransformStep(elem, translate, scale, timeoutMilliseconds, step, steps) {
        var progress = step / steps;

        elem.attr('transform', 'translate(' + (translate[0] * progress) + ', ' + (translate[1] * progress) + ') scale(' + (scale * progress) + ')');

        if (step < steps) {
            setTimeout(function() {
                smoothTransformStep(elem, translate, scale, timeoutMilliseconds, step + 1, steps);
            }, timeoutMilliseconds);
        }
    }
*/
    function tick(nodes, relationships) {
        tickNodes(nodes);
        tickRelationships(relationships);
    }

    function tickNodes(nodes) {
        nodes.attr('transform', function(d) {
            return 'translate(' + d.x + ', ' + d.y + ')';
        });
    }

    function tickRelationships(relationships) {
        relationships.relationships.attr('transform', function(d) {
            var angle = rotation(d.source, d.target);
            return 'translate(' + d.source.x + ', ' + d.source.y + ') rotate(' + angle + ')';
        });

        tickRelationshipsTexts(relationships.texts, relationships.relationships);
        tickRelationshipsOutlines(relationships.relationships);
        tickRelationshipsOverlays(relationships.overlays);
    }

    function tickRelationshipsOutlines(relationships) {
        relationships.each(function(relationship) {
            var rel = d3.select(this),
                outline = rel.select('.outline'),
                text = rel.select('.text'),
                bbox = text.node().getBBox(),
                padding = 3;

            outline.attr('d', function(d) {
                var center = { x: 0, y: 0 },
                    angle = rotation(d.source, d.target),
                    textBoundingBox = text.node().getBBox(),
                    textPadding = 5,
                    u = unitaryVector(d.source, d.target),
                    textMargin = { x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5, y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5 },
                    n = unitaryNormalVector(d.source, d.target),
                    rotatedPointA1 = rotatePoint(center, { x: 0 + (options.nodeRadius + 1) * u.x - n.x, y: 0 + (options.nodeRadius + 1) * u.y - n.y }, angle),
                    rotatedPointB1 = rotatePoint(center, { x: textMargin.x - n.x, y: textMargin.y - n.y }, angle),
                    rotatedPointC1 = rotatePoint(center, { x: textMargin.x, y: textMargin.y }, angle),
                    rotatedPointD1 = rotatePoint(center, { x: 0 + (options.nodeRadius + 1) * u.x, y: 0 + (options.nodeRadius + 1) * u.y }, angle),
                    rotatedPointA2 = rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x - n.x, y: d.target.y - d.source.y - textMargin.y - n.y }, angle),
                    rotatedPointB2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x - u.x * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y - u.y * options.arrowSize }, angle),
                    rotatedPointC2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * options.arrowSize }, angle),
                    rotatedPointD2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y }, angle),
                    rotatedPointE2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x + (- n.x - u.x) * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y + (- n.y - u.y) * options.arrowSize }, angle),
                    rotatedPointF2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - u.x * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - u.y * options.arrowSize }, angle),
                    rotatedPointG2 = rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x, y: d.target.y - d.source.y - textMargin.y }, angle);

                return 'M ' + rotatedPointA1.x + ' ' + rotatedPointA1.y +
                       ' L ' + rotatedPointB1.x + ' ' + rotatedPointB1.y +
                       ' L ' + rotatedPointC1.x + ' ' + rotatedPointC1.y +
                       ' L ' + rotatedPointD1.x + ' ' + rotatedPointD1.y +
                       ' Z M ' + rotatedPointA2.x + ' ' + rotatedPointA2.y +
                       ' L ' + rotatedPointB2.x + ' ' + rotatedPointB2.y +
                       ' L ' + rotatedPointC2.x + ' ' + rotatedPointC2.y +
                       ' L ' + rotatedPointD2.x + ' ' + rotatedPointD2.y +
                       ' L ' + rotatedPointE2.x + ' ' + rotatedPointE2.y +
                       ' L ' + rotatedPointF2.x + ' ' + rotatedPointF2.y +
                       ' L ' + rotatedPointG2.x + ' ' + rotatedPointG2.y +
                       ' Z';
            });
        });
    }

    function tickRelationshipsOutlinesOld(relationships) {
        relationships.each(function(relationship) {
            var rel = d3.select(this),
                outline = rel.select('.outline'),
                text = rel.select('.text'),
                bbox = text.node().getBBox(),
                padding = 3;

            outline.attr('d', function(d) {
                var center = { x: 0, y: 0 },
                    angle = rotation(d.source, d.target),
                    textBoundingBox = text.node().getBBox(),
                    textPadding = 5,
                    u = unitaryVector(d.source, d.target),
                    textMargin = { x: (d.target.x - d.source.x - (textBoundingBox.width + textPadding) * u.x) * 0.5, y: (d.target.y - d.source.y - (textBoundingBox.width + textPadding) * u.y) * 0.5 },
                    n = unitaryNormalVector(d.source, d.target),
                    rotatedPointA1 = rotatePoint(center, { x: 0 + (options.nodeRadius + 1) * u.x - n.x, y: 0 + (options.nodeRadius + 1) * u.y - n.y }, angle),
                    rotatedPointB1 = rotatePoint(center, { x: textMargin.x - n.x, y: textMargin.y - n.y }, angle),
                    rotatedPointC1 = rotatePoint(center, { x: textMargin.x, y: textMargin.y }, angle),
                    rotatedPointD1 = rotatePoint(center, { x: 0 + (options.nodeRadius + 1) * u.x, y: 0 + (options.nodeRadius + 1) * u.y }, angle),
                    rotatedPointA2 = rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x - n.x, y: d.target.y - d.source.y - textMargin.y - n.y }, angle),
                    rotatedPointB2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x - u.x * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y - u.y * options.arrowSize }, angle),
                    rotatedPointC2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - n.x + (n.x - u.x) * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - n.y + (n.y - u.y) * options.arrowSize }, angle),
                    rotatedPointD2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y }, angle),
                    rotatedPointE2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x + (- n.x - u.x) * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y + (- n.y - u.y) * options.arrowSize }, angle),
                    rotatedPointF2 = rotatePoint(center, { x: d.target.x - d.source.x - (options.nodeRadius + 1) * u.x - u.x * options.arrowSize, y: d.target.y - d.source.y - (options.nodeRadius + 1) * u.y - u.y * options.arrowSize }, angle),
                    rotatedPointG2 = rotatePoint(center, { x: d.target.x - d.source.x - textMargin.x, y: d.target.y - d.source.y - textMargin.y }, angle);

                return 'M ' + rotatedPointA1.x + ' ' + rotatedPointA1.y +
                       ' L ' + rotatedPointB1.x + ' ' + rotatedPointB1.y +
                       ' L ' + rotatedPointC1.x + ' ' + rotatedPointC1.y +
                       ' L ' + rotatedPointD1.x + ' ' + rotatedPointD1.y +
                       ' Z M ' + rotatedPointA2.x + ' ' + rotatedPointA2.y +
                       ' L ' + rotatedPointB2.x + ' ' + rotatedPointB2.y +
                       ' L ' + rotatedPointC2.x + ' ' + rotatedPointC2.y +
                       ' L ' + rotatedPointD2.x + ' ' + rotatedPointD2.y +
                       ' L ' + rotatedPointE2.x + ' ' + rotatedPointE2.y +
                       ' L ' + rotatedPointF2.x + ' ' + rotatedPointF2.y +
                       ' L ' + rotatedPointG2.x + ' ' + rotatedPointG2.y +
                       ' Z';
            });
        });
    }

    function tickRelationshipsOverlays(overlays) {
        overlays.attr('d', function(d) {
            var center = { x: 0, y: 0 },
                angle = rotation(d.source, d.target),
                n1 = unitaryNormalVector(d.source, d.target),
                n = unitaryNormalVector(d.source, d.target, 50),
                rotatedPointA = rotatePoint(center, { x: 0 - n.x, y: 0 - n.y }, angle),
                rotatedPointB = rotatePoint(center, { x: d.target.x - d.source.x - n.x, y: d.target.y - d.source.y - n.y }, angle),
                rotatedPointC = rotatePoint(center, { x: d.target.x - d.source.x + n.x - n1.x, y: d.target.y - d.source.y + n.y - n1.y }, angle),
                rotatedPointD = rotatePoint(center, { x: 0 + n.x - n1.x, y: 0 + n.y - n1.y }, angle);

            return 'M ' + rotatedPointA.x + ' ' + rotatedPointA.y +
                   ' L ' + rotatedPointB.x + ' ' + rotatedPointB.y +
                   ' L ' + rotatedPointC.x + ' ' + rotatedPointC.y +
                   ' L ' + rotatedPointD.x + ' ' + rotatedPointD.y +
                   ' Z';
        });
    }

    function tickRelationshipsTexts(texts, relationships) {
        texts.attr('transform', function(d) {
            var angle = (rotation(d.source, d.target) + 360) % 360,
                mirror = angle > 90 && angle < 270,
                center = { x: 0, y: 0 },
                n = unitaryNormalVector(d.source, d.target),
                nWeight = mirror ? 2 : -3,
                point = { x: (d.target.x - d.source.x) * 0.5 + n.x * nWeight, y: (d.target.y - d.source.y) * 0.5 + n.y * nWeight },
                rotatedPoint = rotatePoint(center, point, angle);

            return 'translate(' + rotatedPoint.x + ', ' + rotatedPoint.y + ') rotate(' + (mirror ? 180 : 0) + ')';
        });
    }

    function toString(d) {
        var s = d.labels ? d.labels[0] : d.type;

        s += ' (<id>: ' + d.id;

        Object.keys(d.properties).forEach(function(property) {
            s += ', ' + property + ': ' + JSON.stringify(d.properties[property]);
        });

        s += ')';

        return s;
    }

    function unitaryNormalVector(source, target, newLength) {
        var center = { x: 0, y: 0 },
            vector = unitaryVector(source, target, newLength);

        return rotatePoint(center, vector, 90);
    }

    function unitaryVector(source, target, newLength) {
        var length = Math.sqrt(Math.pow(target.x - source.x, 2) + Math.pow(target.y - source.y, 2)) / Math.sqrt(newLength || 1);

        return {
            x: (target.x - source.x) / length,
            y: (target.y - source.y) / length,
        };
    }

    function updateInfo(d) {
        clearInfo();

        if (d.labels) {
            appendInfoElementNode('info', d.labels[0]);
        } else {
            appendInfoElementRelationship('info', d.type);
        }

        appendInfoElementProperty('btn-default', '&lt;id&gt;', d.id);

        Object.keys(d.properties).forEach(function(property) {
            appendInfoElementProperty('btn-default', property, JSON.stringify(d.properties[property]));
        });
    }

    function zoomFit(transitionDuration) {
        var bounds = svg.node().getBBox(),
            parent = svg.node().parentElement.parentElement,
            fullWidth = parent.clientWidth,
            fullHeight = parent.clientHeight,
            width = bounds.width,
            height = bounds.height,
            midX = bounds.x + width / 2,
            midY = bounds.y + height / 2;

        if (width === 0 || height === 0) {
            return; // nothing to fit
        }

        svgScale = 0.85 / Math.max(width / fullWidth, height / fullHeight);
        svgTranslate = [fullWidth / 2 - svgScale * midX, fullHeight / 2 - svgScale * midY];

        svg.attr('transform', 'translate(' + svgTranslate[0] + ', ' + svgTranslate[1] + ') scale(' + svgScale + ')');
//        smoothTransform(svg, svgTranslate, svgScale);
    }

    // TODO
    function zoomIn() {
        // http://bl.ocks.org/linssen/7352810
        console.error('zoomIn');
    }

    // TODO
    function zoomOut() {
        // http://bl.ocks.org/linssen/7352810
        console.error('zoomOut');
    }

    init(_selector, _options);

    return {
        icons: icons,
        version: version,
        zoomIn: zoomIn,
        zoomOut: zoomOut
    };
}

module.exports = Neo4jD3;

},{}]},{},[1])(1)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvbWFpbi9pbmRleC5qcyIsInNyYy9tYWluL3NjcmlwdHMvbmVvNGpkMy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcblxudmFyIG5lbzRqZDMgPSByZXF1aXJlKCcuL3NjcmlwdHMvbmVvNGpkMycpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IG5lbzRqZDM7XG4iLCIvKiBnbG9iYWwgZDMsIGRvY3VtZW50ICovXHJcbi8qIGpzaGludCBsYXRlZGVmOm5vZnVuYyAqL1xyXG4ndXNlIHN0cmljdCc7XHJcblxyXG5mdW5jdGlvbiBOZW80akQzKF9zZWxlY3RvciwgX29wdGlvbnMpe1xyXG4gICAgdmFyIGNvbnRhaW5lciwgaW5mbywgc2VsZWN0b3IsIHNpbXVsYXRpb24sIHN2Zywgc3ZnU2NhbGUsIHN2Z1RyYW5zbGF0ZSxcclxuICAgICAgICBjbGFzc2VzMkNvbG9ycyA9IHt9LFxyXG4gICAgICAgIGp1c3RMb2FkZWQgPSBmYWxzZSxcclxuICAgICAgICBudW1DbGFzc2VzID0gMCxcclxuICAgICAgICBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBhcnJvd1NpemU6IDQsXHJcbi8vICAgICAgICAgICAgY29sb3JzOiBkMy5zY2hlbWVDYXRlZ29yeTEwLFxyXG4vLyAgICAgICAgICAgIGNvbG9yczogZDMuc2NoZW1lQ2F0ZWdvcnkyMCxcclxuICAgICAgICAgICAgY29sb3JzOiBbXHJcbiAgICAgICAgICAgICAgICAnIzY4YmRmNicsIC8vIGxpZ2h0IGJsdWVcclxuICAgICAgICAgICAgICAgICcjNmRjZTllJywgLy8gZ3JlZW4gIzFcclxuICAgICAgICAgICAgICAgICcjZmFhZmMyJywgLy8gbGlnaHQgcGlua1xyXG4gICAgICAgICAgICAgICAgJyNmMmJhZjYnLCAvLyBwdXJwbGVcclxuICAgICAgICAgICAgICAgICcjZmY5MjhjJywgLy8gbGlnaHQgcmVkXHJcbiAgICAgICAgICAgICAgICAnI2ZjZWE3ZScsIC8vIGxpZ2h0IHllbGxvd1xyXG4gICAgICAgICAgICAgICAgJyNmZmM3NjYnLCAvLyBsaWdodCBvcmFuZ2VcclxuICAgICAgICAgICAgICAgICcjNDA1ZjllJywgLy8gbmF2eSBibHVlXHJcbiAgICAgICAgICAgICAgICAnI2E1YWJiNicsIC8vIGRhcmsgZ3JheVxyXG4gICAgICAgICAgICAgICAgJyM3OGNlY2InLCAvLyBncmVlbiAjMixcclxuICAgICAgICAgICAgICAgICcjYjg4Y2JiJywgLy8gZGFyayBwdXJwbGVcclxuICAgICAgICAgICAgICAgICcjY2VkMmQ5JywgLy8gbGlnaHQgZ3JheVxyXG4gICAgICAgICAgICAgICAgJyNlODQ2NDYnLCAvLyBkYXJrIHJlZFxyXG4gICAgICAgICAgICAgICAgJyNmYTVmODYnLCAvLyBkYXJrIHBpbmtcclxuICAgICAgICAgICAgICAgICcjZmZhYjFhJywgLy8gZGFyayBvcmFuZ2VcclxuICAgICAgICAgICAgICAgICcjZmNkYTE5JywgLy8gZGFyayB5ZWxsb3dcclxuICAgICAgICAgICAgICAgICcjNzk3YjgwJywgLy8gYmxhY2tcclxuICAgICAgICAgICAgICAgICcjYzlkOTZmJywgLy8gcGlzdGFjY2hpb1xyXG4gICAgICAgICAgICAgICAgJyM0Nzk5MWYnLCAvLyBncmVlbiAjM1xyXG4gICAgICAgICAgICAgICAgJyM3MGVkZWUnLCAvLyB0dXJxdW9pc2VcclxuICAgICAgICAgICAgICAgICcjZmY3NWVhJyAgLy8gcGlua1xyXG4gICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICBpY29uTWFwOiB7J2dsYXNzJzonZjAwMCcsJ211c2ljJzonZjAwMScsJ3NlYXJjaCc6J2YwMDInLCdlbnZlbG9wZS1vJzonZjAwMycsJ2hlYXJ0JzonZjAwNCcsJ3N0YXInOidmMDA1Jywnc3Rhci1vJzonZjAwNicsJ3VzZXInOidmMDA3JywnZmlsbSc6J2YwMDgnLCd0aC1sYXJnZSc6J2YwMDknLCd0aCc6J2YwMGEnLCd0aC1saXN0JzonZjAwYicsJ2NoZWNrJzonZjAwYycsJ3JlbW92ZSxjbG9zZSx0aW1lcyc6J2YwMGQnLCdzZWFyY2gtcGx1cyc6J2YwMGUnLCdzZWFyY2gtbWludXMnOidmMDEwJywncG93ZXItb2ZmJzonZjAxMScsJ3NpZ25hbCc6J2YwMTInLCdnZWFyLGNvZyc6J2YwMTMnLCd0cmFzaC1vJzonZjAxNCcsJ2hvbWUnOidmMDE1JywnZmlsZS1vJzonZjAxNicsJ2Nsb2NrLW8nOidmMDE3Jywncm9hZCc6J2YwMTgnLCdkb3dubG9hZCc6J2YwMTknLCdhcnJvdy1jaXJjbGUtby1kb3duJzonZjAxYScsJ2Fycm93LWNpcmNsZS1vLXVwJzonZjAxYicsJ2luYm94JzonZjAxYycsJ3BsYXktY2lyY2xlLW8nOidmMDFkJywncm90YXRlLXJpZ2h0LHJlcGVhdCc6J2YwMWUnLCdyZWZyZXNoJzonZjAyMScsJ2xpc3QtYWx0JzonZjAyMicsJ2xvY2snOidmMDIzJywnZmxhZyc6J2YwMjQnLCdoZWFkcGhvbmVzJzonZjAyNScsJ3ZvbHVtZS1vZmYnOidmMDI2Jywndm9sdW1lLWRvd24nOidmMDI3Jywndm9sdW1lLXVwJzonZjAyOCcsJ3FyY29kZSc6J2YwMjknLCdiYXJjb2RlJzonZjAyYScsJ3RhZyc6J2YwMmInLCd0YWdzJzonZjAyYycsJ2Jvb2snOidmMDJkJywnYm9va21hcmsnOidmMDJlJywncHJpbnQnOidmMDJmJywnY2FtZXJhJzonZjAzMCcsJ2ZvbnQnOidmMDMxJywnYm9sZCc6J2YwMzInLCdpdGFsaWMnOidmMDMzJywndGV4dC1oZWlnaHQnOidmMDM0JywndGV4dC13aWR0aCc6J2YwMzUnLCdhbGlnbi1sZWZ0JzonZjAzNicsJ2FsaWduLWNlbnRlcic6J2YwMzcnLCdhbGlnbi1yaWdodCc6J2YwMzgnLCdhbGlnbi1qdXN0aWZ5JzonZjAzOScsJ2xpc3QnOidmMDNhJywnZGVkZW50LG91dGRlbnQnOidmMDNiJywnaW5kZW50JzonZjAzYycsJ3ZpZGVvLWNhbWVyYSc6J2YwM2QnLCdwaG90byxpbWFnZSxwaWN0dXJlLW8nOidmMDNlJywncGVuY2lsJzonZjA0MCcsJ21hcC1tYXJrZXInOidmMDQxJywnYWRqdXN0JzonZjA0MicsJ3RpbnQnOidmMDQzJywnZWRpdCxwZW5jaWwtc3F1YXJlLW8nOidmMDQ0Jywnc2hhcmUtc3F1YXJlLW8nOidmMDQ1JywnY2hlY2stc3F1YXJlLW8nOidmMDQ2JywnYXJyb3dzJzonZjA0NycsJ3N0ZXAtYmFja3dhcmQnOidmMDQ4JywnZmFzdC1iYWNrd2FyZCc6J2YwNDknLCdiYWNrd2FyZCc6J2YwNGEnLCdwbGF5JzonZjA0YicsJ3BhdXNlJzonZjA0YycsJ3N0b3AnOidmMDRkJywnZm9yd2FyZCc6J2YwNGUnLCdmYXN0LWZvcndhcmQnOidmMDUwJywnc3RlcC1mb3J3YXJkJzonZjA1MScsJ2VqZWN0JzonZjA1MicsJ2NoZXZyb24tbGVmdCc6J2YwNTMnLCdjaGV2cm9uLXJpZ2h0JzonZjA1NCcsJ3BsdXMtY2lyY2xlJzonZjA1NScsJ21pbnVzLWNpcmNsZSc6J2YwNTYnLCd0aW1lcy1jaXJjbGUnOidmMDU3JywnY2hlY2stY2lyY2xlJzonZjA1OCcsJ3F1ZXN0aW9uLWNpcmNsZSc6J2YwNTknLCdpbmZvLWNpcmNsZSc6J2YwNWEnLCdjcm9zc2hhaXJzJzonZjA1YicsJ3RpbWVzLWNpcmNsZS1vJzonZjA1YycsJ2NoZWNrLWNpcmNsZS1vJzonZjA1ZCcsJ2Jhbic6J2YwNWUnLCdhcnJvdy1sZWZ0JzonZjA2MCcsJ2Fycm93LXJpZ2h0JzonZjA2MScsJ2Fycm93LXVwJzonZjA2MicsJ2Fycm93LWRvd24nOidmMDYzJywnbWFpbC1mb3J3YXJkLHNoYXJlJzonZjA2NCcsJ2V4cGFuZCc6J2YwNjUnLCdjb21wcmVzcyc6J2YwNjYnLCdwbHVzJzonZjA2NycsJ21pbnVzJzonZjA2OCcsJ2FzdGVyaXNrJzonZjA2OScsJ2V4Y2xhbWF0aW9uLWNpcmNsZSc6J2YwNmEnLCdnaWZ0JzonZjA2YicsJ2xlYWYnOidmMDZjJywnZmlyZSc6J2YwNmQnLCdleWUnOidmMDZlJywnZXllLXNsYXNoJzonZjA3MCcsJ3dhcm5pbmcsZXhjbGFtYXRpb24tdHJpYW5nbGUnOidmMDcxJywncGxhbmUnOidmMDcyJywnY2FsZW5kYXInOidmMDczJywncmFuZG9tJzonZjA3NCcsJ2NvbW1lbnQnOidmMDc1JywnbWFnbmV0JzonZjA3NicsJ2NoZXZyb24tdXAnOidmMDc3JywnY2hldnJvbi1kb3duJzonZjA3OCcsJ3JldHdlZXQnOidmMDc5Jywnc2hvcHBpbmctY2FydCc6J2YwN2EnLCdmb2xkZXInOidmMDdiJywnZm9sZGVyLW9wZW4nOidmMDdjJywnYXJyb3dzLXYnOidmMDdkJywnYXJyb3dzLWgnOidmMDdlJywnYmFyLWNoYXJ0LW8sYmFyLWNoYXJ0JzonZjA4MCcsJ3R3aXR0ZXItc3F1YXJlJzonZjA4MScsJ2ZhY2Vib29rLXNxdWFyZSc6J2YwODInLCdjYW1lcmEtcmV0cm8nOidmMDgzJywna2V5JzonZjA4NCcsJ2dlYXJzLGNvZ3MnOidmMDg1JywnY29tbWVudHMnOidmMDg2JywndGh1bWJzLW8tdXAnOidmMDg3JywndGh1bWJzLW8tZG93bic6J2YwODgnLCdzdGFyLWhhbGYnOidmMDg5JywnaGVhcnQtbyc6J2YwOGEnLCdzaWduLW91dCc6J2YwOGInLCdsaW5rZWRpbi1zcXVhcmUnOidmMDhjJywndGh1bWItdGFjayc6J2YwOGQnLCdleHRlcm5hbC1saW5rJzonZjA4ZScsJ3NpZ24taW4nOidmMDkwJywndHJvcGh5JzonZjA5MScsJ2dpdGh1Yi1zcXVhcmUnOidmMDkyJywndXBsb2FkJzonZjA5MycsJ2xlbW9uLW8nOidmMDk0JywncGhvbmUnOidmMDk1Jywnc3F1YXJlLW8nOidmMDk2JywnYm9va21hcmstbyc6J2YwOTcnLCdwaG9uZS1zcXVhcmUnOidmMDk4JywndHdpdHRlcic6J2YwOTknLCdmYWNlYm9vay1mLGZhY2Vib29rJzonZjA5YScsJ2dpdGh1Yic6J2YwOWInLCd1bmxvY2snOidmMDljJywnY3JlZGl0LWNhcmQnOidmMDlkJywnZmVlZCxyc3MnOidmMDllJywnaGRkLW8nOidmMGEwJywnYnVsbGhvcm4nOidmMGExJywnYmVsbCc6J2YwZjMnLCdjZXJ0aWZpY2F0ZSc6J2YwYTMnLCdoYW5kLW8tcmlnaHQnOidmMGE0JywnaGFuZC1vLWxlZnQnOidmMGE1JywnaGFuZC1vLXVwJzonZjBhNicsJ2hhbmQtby1kb3duJzonZjBhNycsJ2Fycm93LWNpcmNsZS1sZWZ0JzonZjBhOCcsJ2Fycm93LWNpcmNsZS1yaWdodCc6J2YwYTknLCdhcnJvdy1jaXJjbGUtdXAnOidmMGFhJywnYXJyb3ctY2lyY2xlLWRvd24nOidmMGFiJywnZ2xvYmUnOidmMGFjJywnd3JlbmNoJzonZjBhZCcsJ3Rhc2tzJzonZjBhZScsJ2ZpbHRlcic6J2YwYjAnLCdicmllZmNhc2UnOidmMGIxJywnYXJyb3dzLWFsdCc6J2YwYjInLCdncm91cCx1c2Vycyc6J2YwYzAnLCdjaGFpbixsaW5rJzonZjBjMScsJ2Nsb3VkJzonZjBjMicsJ2ZsYXNrJzonZjBjMycsJ2N1dCxzY2lzc29ycyc6J2YwYzQnLCdjb3B5LGZpbGVzLW8nOidmMGM1JywncGFwZXJjbGlwJzonZjBjNicsJ3NhdmUsZmxvcHB5LW8nOidmMGM3Jywnc3F1YXJlJzonZjBjOCcsJ25hdmljb24scmVvcmRlcixiYXJzJzonZjBjOScsJ2xpc3QtdWwnOidmMGNhJywnbGlzdC1vbCc6J2YwY2InLCdzdHJpa2V0aHJvdWdoJzonZjBjYycsJ3VuZGVybGluZSc6J2YwY2QnLCd0YWJsZSc6J2YwY2UnLCdtYWdpYyc6J2YwZDAnLCd0cnVjayc6J2YwZDEnLCdwaW50ZXJlc3QnOidmMGQyJywncGludGVyZXN0LXNxdWFyZSc6J2YwZDMnLCdnb29nbGUtcGx1cy1zcXVhcmUnOidmMGQ0JywnZ29vZ2xlLXBsdXMnOidmMGQ1JywnbW9uZXknOidmMGQ2JywnY2FyZXQtZG93bic6J2YwZDcnLCdjYXJldC11cCc6J2YwZDgnLCdjYXJldC1sZWZ0JzonZjBkOScsJ2NhcmV0LXJpZ2h0JzonZjBkYScsJ2NvbHVtbnMnOidmMGRiJywndW5zb3J0ZWQsc29ydCc6J2YwZGMnLCdzb3J0LWRvd24sc29ydC1kZXNjJzonZjBkZCcsJ3NvcnQtdXAsc29ydC1hc2MnOidmMGRlJywnZW52ZWxvcGUnOidmMGUwJywnbGlua2VkaW4nOidmMGUxJywncm90YXRlLWxlZnQsdW5kbyc6J2YwZTInLCdsZWdhbCxnYXZlbCc6J2YwZTMnLCdkYXNoYm9hcmQsdGFjaG9tZXRlcic6J2YwZTQnLCdjb21tZW50LW8nOidmMGU1JywnY29tbWVudHMtbyc6J2YwZTYnLCdmbGFzaCxib2x0JzonZjBlNycsJ3NpdGVtYXAnOidmMGU4JywndW1icmVsbGEnOidmMGU5JywncGFzdGUsY2xpcGJvYXJkJzonZjBlYScsJ2xpZ2h0YnVsYi1vJzonZjBlYicsJ2V4Y2hhbmdlJzonZjBlYycsJ2Nsb3VkLWRvd25sb2FkJzonZjBlZCcsJ2Nsb3VkLXVwbG9hZCc6J2YwZWUnLCd1c2VyLW1kJzonZjBmMCcsJ3N0ZXRob3Njb3BlJzonZjBmMScsJ3N1aXRjYXNlJzonZjBmMicsJ2JlbGwtbyc6J2YwYTInLCdjb2ZmZWUnOidmMGY0JywnY3V0bGVyeSc6J2YwZjUnLCdmaWxlLXRleHQtbyc6J2YwZjYnLCdidWlsZGluZy1vJzonZjBmNycsJ2hvc3BpdGFsLW8nOidmMGY4JywnYW1idWxhbmNlJzonZjBmOScsJ21lZGtpdCc6J2YwZmEnLCdmaWdodGVyLWpldCc6J2YwZmInLCdiZWVyJzonZjBmYycsJ2gtc3F1YXJlJzonZjBmZCcsJ3BsdXMtc3F1YXJlJzonZjBmZScsJ2FuZ2xlLWRvdWJsZS1sZWZ0JzonZjEwMCcsJ2FuZ2xlLWRvdWJsZS1yaWdodCc6J2YxMDEnLCdhbmdsZS1kb3VibGUtdXAnOidmMTAyJywnYW5nbGUtZG91YmxlLWRvd24nOidmMTAzJywnYW5nbGUtbGVmdCc6J2YxMDQnLCdhbmdsZS1yaWdodCc6J2YxMDUnLCdhbmdsZS11cCc6J2YxMDYnLCdhbmdsZS1kb3duJzonZjEwNycsJ2Rlc2t0b3AnOidmMTA4JywnbGFwdG9wJzonZjEwOScsJ3RhYmxldCc6J2YxMGEnLCdtb2JpbGUtcGhvbmUsbW9iaWxlJzonZjEwYicsJ2NpcmNsZS1vJzonZjEwYycsJ3F1b3RlLWxlZnQnOidmMTBkJywncXVvdGUtcmlnaHQnOidmMTBlJywnc3Bpbm5lcic6J2YxMTAnLCdjaXJjbGUnOidmMTExJywnbWFpbC1yZXBseSxyZXBseSc6J2YxMTInLCdnaXRodWItYWx0JzonZjExMycsJ2ZvbGRlci1vJzonZjExNCcsJ2ZvbGRlci1vcGVuLW8nOidmMTE1Jywnc21pbGUtbyc6J2YxMTgnLCdmcm93bi1vJzonZjExOScsJ21laC1vJzonZjExYScsJ2dhbWVwYWQnOidmMTFiJywna2V5Ym9hcmQtbyc6J2YxMWMnLCdmbGFnLW8nOidmMTFkJywnZmxhZy1jaGVja2VyZWQnOidmMTFlJywndGVybWluYWwnOidmMTIwJywnY29kZSc6J2YxMjEnLCdtYWlsLXJlcGx5LWFsbCxyZXBseS1hbGwnOidmMTIyJywnc3Rhci1oYWxmLWVtcHR5LHN0YXItaGFsZi1mdWxsLHN0YXItaGFsZi1vJzonZjEyMycsJ2xvY2F0aW9uLWFycm93JzonZjEyNCcsJ2Nyb3AnOidmMTI1JywnY29kZS1mb3JrJzonZjEyNicsJ3VubGluayxjaGFpbi1icm9rZW4nOidmMTI3JywncXVlc3Rpb24nOidmMTI4JywnaW5mbyc6J2YxMjknLCdleGNsYW1hdGlvbic6J2YxMmEnLCdzdXBlcnNjcmlwdCc6J2YxMmInLCdzdWJzY3JpcHQnOidmMTJjJywnZXJhc2VyJzonZjEyZCcsJ3B1enpsZS1waWVjZSc6J2YxMmUnLCdtaWNyb3Bob25lJzonZjEzMCcsJ21pY3JvcGhvbmUtc2xhc2gnOidmMTMxJywnc2hpZWxkJzonZjEzMicsJ2NhbGVuZGFyLW8nOidmMTMzJywnZmlyZS1leHRpbmd1aXNoZXInOidmMTM0Jywncm9ja2V0JzonZjEzNScsJ21heGNkbic6J2YxMzYnLCdjaGV2cm9uLWNpcmNsZS1sZWZ0JzonZjEzNycsJ2NoZXZyb24tY2lyY2xlLXJpZ2h0JzonZjEzOCcsJ2NoZXZyb24tY2lyY2xlLXVwJzonZjEzOScsJ2NoZXZyb24tY2lyY2xlLWRvd24nOidmMTNhJywnaHRtbDUnOidmMTNiJywnY3NzMyc6J2YxM2MnLCdhbmNob3InOidmMTNkJywndW5sb2NrLWFsdCc6J2YxM2UnLCdidWxsc2V5ZSc6J2YxNDAnLCdlbGxpcHNpcy1oJzonZjE0MScsJ2VsbGlwc2lzLXYnOidmMTQyJywncnNzLXNxdWFyZSc6J2YxNDMnLCdwbGF5LWNpcmNsZSc6J2YxNDQnLCd0aWNrZXQnOidmMTQ1JywnbWludXMtc3F1YXJlJzonZjE0NicsJ21pbnVzLXNxdWFyZS1vJzonZjE0NycsJ2xldmVsLXVwJzonZjE0OCcsJ2xldmVsLWRvd24nOidmMTQ5JywnY2hlY2stc3F1YXJlJzonZjE0YScsJ3BlbmNpbC1zcXVhcmUnOidmMTRiJywnZXh0ZXJuYWwtbGluay1zcXVhcmUnOidmMTRjJywnc2hhcmUtc3F1YXJlJzonZjE0ZCcsJ2NvbXBhc3MnOidmMTRlJywndG9nZ2xlLWRvd24sY2FyZXQtc3F1YXJlLW8tZG93bic6J2YxNTAnLCd0b2dnbGUtdXAsY2FyZXQtc3F1YXJlLW8tdXAnOidmMTUxJywndG9nZ2xlLXJpZ2h0LGNhcmV0LXNxdWFyZS1vLXJpZ2h0JzonZjE1MicsJ2V1cm8sZXVyJzonZjE1MycsJ2dicCc6J2YxNTQnLCdkb2xsYXIsdXNkJzonZjE1NScsJ3J1cGVlLGlucic6J2YxNTYnLCdjbnkscm1iLHllbixqcHknOidmMTU3JywncnVibGUscm91YmxlLHJ1Yic6J2YxNTgnLCd3b24sa3J3JzonZjE1OScsJ2JpdGNvaW4sYnRjJzonZjE1YScsJ2ZpbGUnOidmMTViJywnZmlsZS10ZXh0JzonZjE1YycsJ3NvcnQtYWxwaGEtYXNjJzonZjE1ZCcsJ3NvcnQtYWxwaGEtZGVzYyc6J2YxNWUnLCdzb3J0LWFtb3VudC1hc2MnOidmMTYwJywnc29ydC1hbW91bnQtZGVzYyc6J2YxNjEnLCdzb3J0LW51bWVyaWMtYXNjJzonZjE2MicsJ3NvcnQtbnVtZXJpYy1kZXNjJzonZjE2MycsJ3RodW1icy11cCc6J2YxNjQnLCd0aHVtYnMtZG93bic6J2YxNjUnLCd5b3V0dWJlLXNxdWFyZSc6J2YxNjYnLCd5b3V0dWJlJzonZjE2NycsJ3hpbmcnOidmMTY4JywneGluZy1zcXVhcmUnOidmMTY5JywneW91dHViZS1wbGF5JzonZjE2YScsJ2Ryb3Bib3gnOidmMTZiJywnc3RhY2stb3ZlcmZsb3cnOidmMTZjJywnaW5zdGFncmFtJzonZjE2ZCcsJ2ZsaWNrcic6J2YxNmUnLCdhZG4nOidmMTcwJywnYml0YnVja2V0JzonZjE3MScsJ2JpdGJ1Y2tldC1zcXVhcmUnOidmMTcyJywndHVtYmxyJzonZjE3MycsJ3R1bWJsci1zcXVhcmUnOidmMTc0JywnbG9uZy1hcnJvdy1kb3duJzonZjE3NScsJ2xvbmctYXJyb3ctdXAnOidmMTc2JywnbG9uZy1hcnJvdy1sZWZ0JzonZjE3NycsJ2xvbmctYXJyb3ctcmlnaHQnOidmMTc4JywnYXBwbGUnOidmMTc5Jywnd2luZG93cyc6J2YxN2EnLCdhbmRyb2lkJzonZjE3YicsJ2xpbnV4JzonZjE3YycsJ2RyaWJiYmxlJzonZjE3ZCcsJ3NreXBlJzonZjE3ZScsJ2ZvdXJzcXVhcmUnOidmMTgwJywndHJlbGxvJzonZjE4MScsJ2ZlbWFsZSc6J2YxODInLCdtYWxlJzonZjE4MycsJ2dpdHRpcCxncmF0aXBheSc6J2YxODQnLCdzdW4tbyc6J2YxODUnLCdtb29uLW8nOidmMTg2JywnYXJjaGl2ZSc6J2YxODcnLCdidWcnOidmMTg4JywndmsnOidmMTg5Jywnd2VpYm8nOidmMThhJywncmVucmVuJzonZjE4YicsJ3BhZ2VsaW5lcyc6J2YxOGMnLCdzdGFjay1leGNoYW5nZSc6J2YxOGQnLCdhcnJvdy1jaXJjbGUtby1yaWdodCc6J2YxOGUnLCdhcnJvdy1jaXJjbGUtby1sZWZ0JzonZjE5MCcsJ3RvZ2dsZS1sZWZ0LGNhcmV0LXNxdWFyZS1vLWxlZnQnOidmMTkxJywnZG90LWNpcmNsZS1vJzonZjE5MicsJ3doZWVsY2hhaXInOidmMTkzJywndmltZW8tc3F1YXJlJzonZjE5NCcsJ3R1cmtpc2gtbGlyYSx0cnknOidmMTk1JywncGx1cy1zcXVhcmUtbyc6J2YxOTYnLCdzcGFjZS1zaHV0dGxlJzonZjE5NycsJ3NsYWNrJzonZjE5OCcsJ2VudmVsb3BlLXNxdWFyZSc6J2YxOTknLCd3b3JkcHJlc3MnOidmMTlhJywnb3BlbmlkJzonZjE5YicsJ2luc3RpdHV0aW9uLGJhbmssdW5pdmVyc2l0eSc6J2YxOWMnLCdtb3J0YXItYm9hcmQsZ3JhZHVhdGlvbi1jYXAnOidmMTlkJywneWFob28nOidmMTllJywnZ29vZ2xlJzonZjFhMCcsJ3JlZGRpdCc6J2YxYTEnLCdyZWRkaXQtc3F1YXJlJzonZjFhMicsJ3N0dW1ibGV1cG9uLWNpcmNsZSc6J2YxYTMnLCdzdHVtYmxldXBvbic6J2YxYTQnLCdkZWxpY2lvdXMnOidmMWE1JywnZGlnZyc6J2YxYTYnLCdwaWVkLXBpcGVyLXBwJzonZjFhNycsJ3BpZWQtcGlwZXItYWx0JzonZjFhOCcsJ2RydXBhbCc6J2YxYTknLCdqb29tbGEnOidmMWFhJywnbGFuZ3VhZ2UnOidmMWFiJywnZmF4JzonZjFhYycsJ2J1aWxkaW5nJzonZjFhZCcsJ2NoaWxkJzonZjFhZScsJ3Bhdyc6J2YxYjAnLCdzcG9vbic6J2YxYjEnLCdjdWJlJzonZjFiMicsJ2N1YmVzJzonZjFiMycsJ2JlaGFuY2UnOidmMWI0JywnYmVoYW5jZS1zcXVhcmUnOidmMWI1Jywnc3RlYW0nOidmMWI2Jywnc3RlYW0tc3F1YXJlJzonZjFiNycsJ3JlY3ljbGUnOidmMWI4JywnYXV0b21vYmlsZSxjYXInOidmMWI5JywnY2FiLHRheGknOidmMWJhJywndHJlZSc6J2YxYmInLCdzcG90aWZ5JzonZjFiYycsJ2RldmlhbnRhcnQnOidmMWJkJywnc291bmRjbG91ZCc6J2YxYmUnLCdkYXRhYmFzZSc6J2YxYzAnLCdmaWxlLXBkZi1vJzonZjFjMScsJ2ZpbGUtd29yZC1vJzonZjFjMicsJ2ZpbGUtZXhjZWwtbyc6J2YxYzMnLCdmaWxlLXBvd2VycG9pbnQtbyc6J2YxYzQnLCdmaWxlLXBob3RvLW8sZmlsZS1waWN0dXJlLW8sZmlsZS1pbWFnZS1vJzonZjFjNScsJ2ZpbGUtemlwLW8sZmlsZS1hcmNoaXZlLW8nOidmMWM2JywnZmlsZS1zb3VuZC1vLGZpbGUtYXVkaW8tbyc6J2YxYzcnLCdmaWxlLW1vdmllLW8sZmlsZS12aWRlby1vJzonZjFjOCcsJ2ZpbGUtY29kZS1vJzonZjFjOScsJ3ZpbmUnOidmMWNhJywnY29kZXBlbic6J2YxY2InLCdqc2ZpZGRsZSc6J2YxY2MnLCdsaWZlLWJvdXksbGlmZS1idW95LGxpZmUtc2F2ZXIsc3VwcG9ydCxsaWZlLXJpbmcnOidmMWNkJywnY2lyY2xlLW8tbm90Y2gnOidmMWNlJywncmEscmVzaXN0YW5jZSxyZWJlbCc6J2YxZDAnLCdnZSxlbXBpcmUnOidmMWQxJywnZ2l0LXNxdWFyZSc6J2YxZDInLCdnaXQnOidmMWQzJywneS1jb21iaW5hdG9yLXNxdWFyZSx5Yy1zcXVhcmUsaGFja2VyLW5ld3MnOidmMWQ0JywndGVuY2VudC13ZWlibyc6J2YxZDUnLCdxcSc6J2YxZDYnLCd3ZWNoYXQsd2VpeGluJzonZjFkNycsJ3NlbmQscGFwZXItcGxhbmUnOidmMWQ4Jywnc2VuZC1vLHBhcGVyLXBsYW5lLW8nOidmMWQ5JywnaGlzdG9yeSc6J2YxZGEnLCdjaXJjbGUtdGhpbic6J2YxZGInLCdoZWFkZXInOidmMWRjJywncGFyYWdyYXBoJzonZjFkZCcsJ3NsaWRlcnMnOidmMWRlJywnc2hhcmUtYWx0JzonZjFlMCcsJ3NoYXJlLWFsdC1zcXVhcmUnOidmMWUxJywnYm9tYic6J2YxZTInLCdzb2NjZXItYmFsbC1vLGZ1dGJvbC1vJzonZjFlMycsJ3R0eSc6J2YxZTQnLCdiaW5vY3VsYXJzJzonZjFlNScsJ3BsdWcnOidmMWU2Jywnc2xpZGVzaGFyZSc6J2YxZTcnLCd0d2l0Y2gnOidmMWU4JywneWVscCc6J2YxZTknLCduZXdzcGFwZXItbyc6J2YxZWEnLCd3aWZpJzonZjFlYicsJ2NhbGN1bGF0b3InOidmMWVjJywncGF5cGFsJzonZjFlZCcsJ2dvb2dsZS13YWxsZXQnOidmMWVlJywnY2MtdmlzYSc6J2YxZjAnLCdjYy1tYXN0ZXJjYXJkJzonZjFmMScsJ2NjLWRpc2NvdmVyJzonZjFmMicsJ2NjLWFtZXgnOidmMWYzJywnY2MtcGF5cGFsJzonZjFmNCcsJ2NjLXN0cmlwZSc6J2YxZjUnLCdiZWxsLXNsYXNoJzonZjFmNicsJ2JlbGwtc2xhc2gtbyc6J2YxZjcnLCd0cmFzaCc6J2YxZjgnLCdjb3B5cmlnaHQnOidmMWY5JywnYXQnOidmMWZhJywnZXllZHJvcHBlcic6J2YxZmInLCdwYWludC1icnVzaCc6J2YxZmMnLCdiaXJ0aGRheS1jYWtlJzonZjFmZCcsJ2FyZWEtY2hhcnQnOidmMWZlJywncGllLWNoYXJ0JzonZjIwMCcsJ2xpbmUtY2hhcnQnOidmMjAxJywnbGFzdGZtJzonZjIwMicsJ2xhc3RmbS1zcXVhcmUnOidmMjAzJywndG9nZ2xlLW9mZic6J2YyMDQnLCd0b2dnbGUtb24nOidmMjA1JywnYmljeWNsZSc6J2YyMDYnLCdidXMnOidmMjA3JywnaW94aG9zdCc6J2YyMDgnLCdhbmdlbGxpc3QnOidmMjA5JywnY2MnOidmMjBhJywnc2hla2VsLHNoZXFlbCxpbHMnOidmMjBiJywnbWVhbnBhdGgnOidmMjBjJywnYnV5c2VsbGFkcyc6J2YyMGQnLCdjb25uZWN0ZGV2ZWxvcCc6J2YyMGUnLCdkYXNoY3ViZSc6J2YyMTAnLCdmb3J1bWJlZSc6J2YyMTEnLCdsZWFucHViJzonZjIxMicsJ3NlbGxzeSc6J2YyMTMnLCdzaGlydHNpbmJ1bGsnOidmMjE0Jywnc2ltcGx5YnVpbHQnOidmMjE1Jywnc2t5YXRsYXMnOidmMjE2JywnY2FydC1wbHVzJzonZjIxNycsJ2NhcnQtYXJyb3ctZG93bic6J2YyMTgnLCdkaWFtb25kJzonZjIxOScsJ3NoaXAnOidmMjFhJywndXNlci1zZWNyZXQnOidmMjFiJywnbW90b3JjeWNsZSc6J2YyMWMnLCdzdHJlZXQtdmlldyc6J2YyMWQnLCdoZWFydGJlYXQnOidmMjFlJywndmVudXMnOidmMjIxJywnbWFycyc6J2YyMjInLCdtZXJjdXJ5JzonZjIyMycsJ2ludGVyc2V4LHRyYW5zZ2VuZGVyJzonZjIyNCcsJ3RyYW5zZ2VuZGVyLWFsdCc6J2YyMjUnLCd2ZW51cy1kb3VibGUnOidmMjI2JywnbWFycy1kb3VibGUnOidmMjI3JywndmVudXMtbWFycyc6J2YyMjgnLCdtYXJzLXN0cm9rZSc6J2YyMjknLCdtYXJzLXN0cm9rZS12JzonZjIyYScsJ21hcnMtc3Ryb2tlLWgnOidmMjJiJywnbmV1dGVyJzonZjIyYycsJ2dlbmRlcmxlc3MnOidmMjJkJywnZmFjZWJvb2stb2ZmaWNpYWwnOidmMjMwJywncGludGVyZXN0LXAnOidmMjMxJywnd2hhdHNhcHAnOidmMjMyJywnc2VydmVyJzonZjIzMycsJ3VzZXItcGx1cyc6J2YyMzQnLCd1c2VyLXRpbWVzJzonZjIzNScsJ2hvdGVsLGJlZCc6J2YyMzYnLCd2aWFjb2luJzonZjIzNycsJ3RyYWluJzonZjIzOCcsJ3N1YndheSc6J2YyMzknLCdtZWRpdW0nOidmMjNhJywneWMseS1jb21iaW5hdG9yJzonZjIzYicsJ29wdGluLW1vbnN0ZXInOidmMjNjJywnb3BlbmNhcnQnOidmMjNkJywnZXhwZWRpdGVkc3NsJzonZjIzZScsJ2JhdHRlcnktNCxiYXR0ZXJ5LWZ1bGwnOidmMjQwJywnYmF0dGVyeS0zLGJhdHRlcnktdGhyZWUtcXVhcnRlcnMnOidmMjQxJywnYmF0dGVyeS0yLGJhdHRlcnktaGFsZic6J2YyNDInLCdiYXR0ZXJ5LTEsYmF0dGVyeS1xdWFydGVyJzonZjI0MycsJ2JhdHRlcnktMCxiYXR0ZXJ5LWVtcHR5JzonZjI0NCcsJ21vdXNlLXBvaW50ZXInOidmMjQ1JywnaS1jdXJzb3InOidmMjQ2Jywnb2JqZWN0LWdyb3VwJzonZjI0NycsJ29iamVjdC11bmdyb3VwJzonZjI0OCcsJ3N0aWNreS1ub3RlJzonZjI0OScsJ3N0aWNreS1ub3RlLW8nOidmMjRhJywnY2MtamNiJzonZjI0YicsJ2NjLWRpbmVycy1jbHViJzonZjI0YycsJ2Nsb25lJzonZjI0ZCcsJ2JhbGFuY2Utc2NhbGUnOidmMjRlJywnaG91cmdsYXNzLW8nOidmMjUwJywnaG91cmdsYXNzLTEsaG91cmdsYXNzLXN0YXJ0JzonZjI1MScsJ2hvdXJnbGFzcy0yLGhvdXJnbGFzcy1oYWxmJzonZjI1MicsJ2hvdXJnbGFzcy0zLGhvdXJnbGFzcy1lbmQnOidmMjUzJywnaG91cmdsYXNzJzonZjI1NCcsJ2hhbmQtZ3JhYi1vLGhhbmQtcm9jay1vJzonZjI1NScsJ2hhbmQtc3RvcC1vLGhhbmQtcGFwZXItbyc6J2YyNTYnLCdoYW5kLXNjaXNzb3JzLW8nOidmMjU3JywnaGFuZC1saXphcmQtbyc6J2YyNTgnLCdoYW5kLXNwb2NrLW8nOidmMjU5JywnaGFuZC1wb2ludGVyLW8nOidmMjVhJywnaGFuZC1wZWFjZS1vJzonZjI1YicsJ3RyYWRlbWFyayc6J2YyNWMnLCdyZWdpc3RlcmVkJzonZjI1ZCcsJ2NyZWF0aXZlLWNvbW1vbnMnOidmMjVlJywnZ2cnOidmMjYwJywnZ2ctY2lyY2xlJzonZjI2MScsJ3RyaXBhZHZpc29yJzonZjI2MicsJ29kbm9rbGFzc25pa2knOidmMjYzJywnb2Rub2tsYXNzbmlraS1zcXVhcmUnOidmMjY0JywnZ2V0LXBvY2tldCc6J2YyNjUnLCd3aWtpcGVkaWEtdyc6J2YyNjYnLCdzYWZhcmknOidmMjY3JywnY2hyb21lJzonZjI2OCcsJ2ZpcmVmb3gnOidmMjY5Jywnb3BlcmEnOidmMjZhJywnaW50ZXJuZXQtZXhwbG9yZXInOidmMjZiJywndHYsdGVsZXZpc2lvbic6J2YyNmMnLCdjb250YW8nOidmMjZkJywnNTAwcHgnOidmMjZlJywnYW1hem9uJzonZjI3MCcsJ2NhbGVuZGFyLXBsdXMtbyc6J2YyNzEnLCdjYWxlbmRhci1taW51cy1vJzonZjI3MicsJ2NhbGVuZGFyLXRpbWVzLW8nOidmMjczJywnY2FsZW5kYXItY2hlY2stbyc6J2YyNzQnLCdpbmR1c3RyeSc6J2YyNzUnLCdtYXAtcGluJzonZjI3NicsJ21hcC1zaWducyc6J2YyNzcnLCdtYXAtbyc6J2YyNzgnLCdtYXAnOidmMjc5JywnY29tbWVudGluZyc6J2YyN2EnLCdjb21tZW50aW5nLW8nOidmMjdiJywnaG91enonOidmMjdjJywndmltZW8nOidmMjdkJywnYmxhY2stdGllJzonZjI3ZScsJ2ZvbnRpY29ucyc6J2YyODAnLCdyZWRkaXQtYWxpZW4nOidmMjgxJywnZWRnZSc6J2YyODInLCdjcmVkaXQtY2FyZC1hbHQnOidmMjgzJywnY29kaWVwaWUnOidmMjg0JywnbW9keCc6J2YyODUnLCdmb3J0LWF3ZXNvbWUnOidmMjg2JywndXNiJzonZjI4NycsJ3Byb2R1Y3QtaHVudCc6J2YyODgnLCdtaXhjbG91ZCc6J2YyODknLCdzY3JpYmQnOidmMjhhJywncGF1c2UtY2lyY2xlJzonZjI4YicsJ3BhdXNlLWNpcmNsZS1vJzonZjI4YycsJ3N0b3AtY2lyY2xlJzonZjI4ZCcsJ3N0b3AtY2lyY2xlLW8nOidmMjhlJywnc2hvcHBpbmctYmFnJzonZjI5MCcsJ3Nob3BwaW5nLWJhc2tldCc6J2YyOTEnLCdoYXNodGFnJzonZjI5MicsJ2JsdWV0b290aCc6J2YyOTMnLCdibHVldG9vdGgtYic6J2YyOTQnLCdwZXJjZW50JzonZjI5NScsJ2dpdGxhYic6J2YyOTYnLCd3cGJlZ2lubmVyJzonZjI5NycsJ3dwZm9ybXMnOidmMjk4JywnZW52aXJhJzonZjI5OScsJ3VuaXZlcnNhbC1hY2Nlc3MnOidmMjlhJywnd2hlZWxjaGFpci1hbHQnOidmMjliJywncXVlc3Rpb24tY2lyY2xlLW8nOidmMjljJywnYmxpbmQnOidmMjlkJywnYXVkaW8tZGVzY3JpcHRpb24nOidmMjllJywndm9sdW1lLWNvbnRyb2wtcGhvbmUnOidmMmEwJywnYnJhaWxsZSc6J2YyYTEnLCdhc3Npc3RpdmUtbGlzdGVuaW5nLXN5c3RlbXMnOidmMmEyJywnYXNsLWludGVycHJldGluZyxhbWVyaWNhbi1zaWduLWxhbmd1YWdlLWludGVycHJldGluZyc6J2YyYTMnLCdkZWFmbmVzcyxoYXJkLW9mLWhlYXJpbmcsZGVhZic6J2YyYTQnLCdnbGlkZSc6J2YyYTUnLCdnbGlkZS1nJzonZjJhNicsJ3NpZ25pbmcsc2lnbi1sYW5ndWFnZSc6J2YyYTcnLCdsb3ctdmlzaW9uJzonZjJhOCcsJ3ZpYWRlbyc6J2YyYTknLCd2aWFkZW8tc3F1YXJlJzonZjJhYScsJ3NuYXBjaGF0JzonZjJhYicsJ3NuYXBjaGF0LWdob3N0JzonZjJhYycsJ3NuYXBjaGF0LXNxdWFyZSc6J2YyYWQnLCdwaWVkLXBpcGVyJzonZjJhZScsJ2ZpcnN0LW9yZGVyJzonZjJiMCcsJ3lvYXN0JzonZjJiMScsJ3RoZW1laXNsZSc6J2YyYjInLCdnb29nbGUtcGx1cy1jaXJjbGUsZ29vZ2xlLXBsdXMtb2ZmaWNpYWwnOidmMmIzJywnZmEsZm9udC1hd2Vzb21lJzonZjJiNCd9LFxyXG4gICAgICAgICAgICBpY29uczogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBpbmZvUGFuZWw6IHRydWUsXHJcbiAgICAgICAgICAgIG1pbkNvbGxpc2lvbjogdW5kZWZpbmVkLFxyXG4gICAgICAgICAgICBub2RlUmFkaXVzOiAyNSxcclxuICAgICAgICAgICAgcmVsYXRpb25zaGlwQ29sb3I6ICcjYTVhYmI2JyxcclxuICAgICAgICAgICAgc2hvd0ljb25zOiBmYWxzZSxcclxuICAgICAgICAgICAgem9vbUZpdDogZmFsc2VcclxuICAgICAgICB9LFxyXG4gICAgICAgIHZlcnNpb24gPSAnMC4wLjEnO1xyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZEdyYXBoKGNvbnRhaW5lcikge1xyXG4gICAgICAgIHZhciBzdmcgPSBjb250YWluZXIuYXBwZW5kKCdzdmcnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAnMTAwJScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAnMTAwJScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICduZW80amQzLWdyYXBoJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmNhbGwoZDMuem9vbSgpLm9uKCd6b29tJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2NhbGUgPSBkMy5ldmVudC50cmFuc2Zvcm0uayxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGUgPSBbZDMuZXZlbnQudHJhbnNmb3JtLngsIGQzLmV2ZW50LnRyYW5zZm9ybS55XTtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3ZnVHJhbnNsYXRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJhbnNsYXRlWzBdICs9IHN2Z1RyYW5zbGF0ZVswXTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmFuc2xhdGVbMV0gKz0gc3ZnVHJhbnNsYXRlWzFdO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdmdTY2FsZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjYWxlICo9IHN2Z1NjYWxlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN2Zy5hdHRyKCd0cmFuc2Zvcm0nLCAndHJhbnNsYXRlKCcgKyB0cmFuc2xhdGVbMF0gKyAnLCAnICsgdHJhbnNsYXRlWzFdICsgJykgc2NhbGUoJyArIHNjYWxlICsgJyknKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5vbignZGJsY2xpY2suem9vbScsIG51bGwpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCAnMTAwJScpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCAnMTAwJScpO1xyXG5cclxuICAgICAgICByZXR1cm4gc3ZnO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZEluZm8oY29udGFpbmVyKSB7XHJcbiAgICAgICAgcmV0dXJuIGNvbnRhaW5lci5hcHBlbmQoJ2RpdicpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICduZW80amQzLWluZm8gJyArIG9wdGlvbnMuaW5mb1Bvc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmRJbmZvRWxlbWVudChjbHMsIGlzTm9kZSwgcHJvcGVydHksIHZhbHVlKSB7XHJcbiAgICAgICAgdmFyIGVsZW0gPSBpbmZvLmFwcGVuZCgnYScpO1xyXG5cclxuICAgICAgICBlbGVtLmF0dHIoJ2hyZWYnLCAnIycpXHJcbiAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdidG4gJyArIGNscyArICcgZGlzYWJsZWQnKVxyXG4gICAgICAgICAgICAuYXR0cigncm9sZScsICdidXR0b24nKVxyXG4gICAgICAgICAgICAuaHRtbCgnPHN0cm9uZz4nICsgcHJvcGVydHkgKyAnPC9zdHJvbmc+JyArICh2YWx1ZSA/ICgnOiAnICsgdmFsdWUpIDogJycpKTtcclxuXHJcbiAgICAgICAgaWYgKCF2YWx1ZSkge1xyXG4gICAgICAgICAgICBlbGVtLnN0eWxlKCdiYWNrZ3JvdW5kLWNvbG9yJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIGlzTm9kZSA/IGNsYXNzMmNvbG9yKHByb3BlcnR5KSA6IGRlZmF1bHRDb2xvcigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuc3R5bGUoJ2JvcmRlci1jb2xvcicsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiBpc05vZGUgPyBjbGFzczJkYXJrZW5Db2xvcihwcm9wZXJ0eSkgOiBkZWZhdWx0RGFya2VuQ29sb3IoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZEluZm9FbGVtZW50Tm9kZShjbHMsIG5vZGUpIHtcclxuICAgICAgICBhcHBlbmRJbmZvRWxlbWVudChjbHMsIHRydWUsIG5vZGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZEluZm9FbGVtZW50UHJvcGVydHkoY2xzLCBwcm9wZXJ0eSwgdmFsdWUpIHtcclxuICAgICAgICBhcHBlbmRJbmZvRWxlbWVudChjbHMsIGZhbHNlLCBwcm9wZXJ0eSwgdmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZEluZm9FbGVtZW50UmVsYXRpb25zaGlwKGNscywgcmVsYXRpb25zaGlwKSB7XHJcbiAgICAgICAgYXBwZW5kSW5mb0VsZW1lbnQoY2xzLCBmYWxzZSwgcmVsYXRpb25zaGlwKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmROb2RlcyhzdmcsIGdyYXBoTm9kZXMpIHtcclxuICAgICAgICByZXR1cm4gc3ZnLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdub2RlcycpXHJcbiAgICAgICAgICAgICAgICAgIC5zZWxlY3RBbGwoJ2NpcmNsZScpXHJcbiAgICAgICAgICAgICAgICAgIC5kYXRhKGdyYXBoTm9kZXMpXHJcbiAgICAgICAgICAgICAgICAgIC5lbnRlcigpLmFwcGVuZCgnZycpXHJcbiAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnbm9kZSc7XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIC5vbignZGJsY2xpY2snLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG9wdGlvbnMub25Ob2RlRG91YmxlQ2xpY2sgPT09ICdmdW5jdGlvbicpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRpb25zLm9uTm9kZURvdWJsZUNsaWNrKGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUluZm8oZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIC5vbignbW91c2VsZWF2ZScsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmIChpbmZvKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgY2xlYXJJbmZvKGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAuY2FsbChkMy5kcmFnKClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ3N0YXJ0JywgZHJhZ1N0YXJ0ZWQpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgLm9uKCdkcmFnJywgZHJhZ2dlZClcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAub24oJ2VuZCcsIGRyYWdFbmRlZCkpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZE5vZGVzT3V0bGluZXMobm9kZXMpIHtcclxuICAgICAgICBub2Rlcy5hcHBlbmQoJ2NpcmNsZScpXHJcbiAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAnb3V0bGluZScpXHJcbiAgICAgICAgICAgICAuYXR0cigncicsIG9wdGlvbnMubm9kZVJhZGl1cylcclxuICAgICAgICAgICAgIC5zdHlsZSgnZmlsbCcsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICByZXR1cm4gY2xhc3MyY29sb3IoZC5sYWJlbHNbMF0pO1xyXG4gICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgIC5zdHlsZSgnc3Ryb2tlJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgIHJldHVybiBjbGFzczJkYXJrZW5Db2xvcihkLmxhYmVsc1swXSk7XHJcbiAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgLmFwcGVuZCgndGl0bGUnKS50ZXh0KGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICByZXR1cm4gdG9TdHJpbmcoZCk7XHJcbiAgICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmROb2Rlc1JpbmdzKG5vZGVzKSB7XHJcbiAgICAgICAgbm9kZXMuYXBwZW5kKCdjaXJjbGUnKVxyXG4gICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3JpbmcnKVxyXG4gICAgICAgICAgICAgLmF0dHIoJ3InLCBvcHRpb25zLm5vZGVSYWRpdXMgKiAxLjE2KVxyXG4gICAgICAgICAgICAgLmFwcGVuZCgndGl0bGUnKS50ZXh0KGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICByZXR1cm4gdG9TdHJpbmcoZCk7XHJcbiAgICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmROb2Rlc1RleHRzKG5vZGVzKSB7XHJcbiAgICAgICAgbm9kZXMuYXBwZW5kKCd0ZXh0JylcclxuICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICByZXR1cm4gJ25vZGUtdGV4dCcgKyAoaWNvbkNvZGUoZCkgPyAnIG5vZGUtaWNvbicgOiAnJyk7XHJcbiAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgLmF0dHIoJ2ZpbGwnLCAnI2ZmZmZmZicpXHJcbiAgICAgICAgICAgICAuYXR0cignZm9udC1zaXplJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgIHJldHVybiBpY29uQ29kZShkKSA/IChvcHRpb25zLm5vZGVSYWRpdXMgKyAncHgnKSA6ICcxMHB4JztcclxuICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAuYXR0cigncG9pbnRlci1ldmVudHMnLCAnbm9uZScpXHJcbiAgICAgICAgICAgICAuYXR0cigndGV4dC1hbmNob3InLCAnbWlkZGxlJylcclxuICAgICAgICAgICAgIC5hdHRyKCd5JywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgIHJldHVybiBpY29uQ29kZShkKSA/IChwYXJzZUludChNYXRoLnJvdW5kKG9wdGlvbnMubm9kZVJhZGl1cyAqIDAuMzIpKSArICdweCcpIDogJzRweCc7XHJcbiAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgLmh0bWwoZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgIHZhciBpY29uID0gaWNvbkNvZGUoZCk7XHJcbiAgICAgICAgICAgICAgICAgcmV0dXJuIGljb24gPyAnJiN4JyArIGljb24gOiBkLmlkO1xyXG4gICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwZW5kTm9kZXNUb0dyYXBoKHN2ZywgZ3JhcGhOb2Rlcykge1xyXG4gICAgICAgIHZhciBub2RlcyA9IGFwcGVuZE5vZGVzKHN2ZywgZ3JhcGhOb2Rlcyk7XHJcblxyXG4gICAgICAgIGFwcGVuZE5vZGVzUmluZ3Mobm9kZXMpO1xyXG4gICAgICAgIGFwcGVuZE5vZGVzT3V0bGluZXMobm9kZXMpO1xyXG4gICAgICAgIGFwcGVuZE5vZGVzVGV4dHMobm9kZXMpO1xyXG5cclxuICAgICAgICByZXR1cm4gbm9kZXM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwZW5kUmVsYXRpb25zaGlwcyhzdmcsIGdyYXBoUmVsYXRpb25zaGlwcykge1xyXG4gICAgICAgIHJldHVybiBzdmcuYXBwZW5kKCdnJylcclxuICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ3JlbGF0aW9uc2hpcHMnKVxyXG4gICAgICAgICAgICAgICAgICAuc2VsZWN0QWxsKCdsaW5lJylcclxuICAgICAgICAgICAgICAgICAgLmRhdGEoZ3JhcGhSZWxhdGlvbnNoaXBzKVxyXG4gICAgICAgICAgICAgICAgICAuZW50ZXIoKS5hcHBlbmQoJ2cnKVxyXG4gICAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAncmVsYXRpb25zaGlwJylcclxuICAgICAgICAgICAgICAgICAgLm9uKCdkYmxjbGljaycsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2Ygb3B0aW9ucy5vblJlbGF0aW9uc2hpcERvdWJsZUNsaWNrID09PSAnZnVuY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0aW9ucy5vblJlbGF0aW9uc2hpcERvdWJsZUNsaWNrKGQpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAub24oJ21vdXNlZW50ZXInLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5mbykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIHVwZGF0ZUluZm8oZCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGFwcGVuZFJlbGF0aW9uc2hpcHNPdXRsaW5lcyhyZWxhdGlvbnNoaXBzKSB7XHJcbiAgICAgICAgcmV0dXJuIHJlbGF0aW9uc2hpcHMuYXBwZW5kKCdwYXRoJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdjbGFzcycsICdvdXRsaW5lJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmaWxsJywgJyNhNWFiYjYnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ3N0cm9rZScsICdub25lJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYXBwZW5kUmVsYXRpb25zaGlwc092ZXJsYXlzKHJlbGF0aW9uc2hpcHMpIHtcclxuICAgICAgICByZXR1cm4gcmVsYXRpb25zaGlwcy5hcHBlbmQoJ3BhdGgnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLmF0dHIoJ2NsYXNzJywgJ292ZXJsYXknKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmRSZWxhdGlvbnNoaXBzVGV4dHMocmVsYXRpb25zaGlwcykge1xyXG4gICAgICAgIHJldHVybiByZWxhdGlvbnNoaXBzLmFwcGVuZCgndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignY2xhc3MnLCAndGV4dCcpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAuYXR0cignZmlsbCcsICcjMDAwMDAwJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdmb250LXNpemUnLCAnOHB4JylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCdwb2ludGVyLWV2ZW50cycsICdub25lJylcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC5hdHRyKCd0ZXh0LWFuY2hvcicsICdtaWRkbGUnKVxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRleHQoZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLnR5cGU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBhcHBlbmRSZWxhdGlvbnNoaXBzVG9HcmFwaChzdmcsIGdyYXBoUmVsYXRpb25zaGlwcykge1xyXG4gICAgICAgIHZhciByZWxhdGlvbnNoaXBzID0gYXBwZW5kUmVsYXRpb25zaGlwcyhzdmcsIGdyYXBoUmVsYXRpb25zaGlwcyksXHJcbiAgICAgICAgICAgIHRleHRzID0gYXBwZW5kUmVsYXRpb25zaGlwc1RleHRzKHJlbGF0aW9uc2hpcHMpLFxyXG4gICAgICAgICAgICBvdXRsaW5lcyA9IGFwcGVuZFJlbGF0aW9uc2hpcHNPdXRsaW5lcyhyZWxhdGlvbnNoaXBzKSxcclxuICAgICAgICAgICAgb3ZlcmxheXMgPSBhcHBlbmRSZWxhdGlvbnNoaXBzT3ZlcmxheXMocmVsYXRpb25zaGlwcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG91dGxpbmVzOiBvdXRsaW5lcyxcclxuICAgICAgICAgICAgb3ZlcmxheXM6IG92ZXJsYXlzLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXBzOiByZWxhdGlvbnNoaXBzLFxyXG4gICAgICAgICAgICB0ZXh0czogdGV4dHNcclxuICAgICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNsYXNzMmNvbG9yKGNscykge1xyXG4gICAgICAgIHZhciBjb2xvciA9IGNsYXNzZXMyQ29sb3JzW2Nsc107XHJcblxyXG4gICAgICAgIGlmICghY29sb3IpIHtcclxuLy8gICAgICAgICAgICBjb2xvciA9IG9wdGlvbnMuY29sb3JzW01hdGgubWluKG51bUNsYXNzZXMsIG9wdGlvbnMuY29sb3JzLmxlbmd0aCAtIDEpXTtcclxuICAgICAgICAgICAgY29sb3IgPSBvcHRpb25zLmNvbG9yc1tudW1DbGFzc2VzICUgb3B0aW9ucy5jb2xvcnMubGVuZ3RoXTtcclxuICAgICAgICAgICAgY2xhc3NlczJDb2xvcnNbY2xzXSA9IGNvbG9yO1xyXG4gICAgICAgICAgICBudW1DbGFzc2VzKys7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xhc3MyZGFya2VuQ29sb3IoY2xzKSB7XHJcbiAgICAgICAgcmV0dXJuIGQzLnJnYihjbGFzczJjb2xvcihjbHMpKS5kYXJrZXIoMSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2xlYXJJbmZvKCkge1xyXG4gICAgICAgIGluZm8uaHRtbCgnJyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY29udGFpbnMoYXJyYXksIGlkKSB7XHJcbiAgICAgICAgdmFyIGZpbHRlciA9IGFycmF5LmZpbHRlcihmdW5jdGlvbihlbGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBlbGVtLmlkID09PSBpZDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGZpbHRlci5sZW5ndGggPiAwO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRhdGEyZ3JhcGgoZGF0YSkge1xyXG4gICAgICAgIHZhciBncmFwaCA9IHtcclxuICAgICAgICAgICAgbm9kZXM6IFtdLFxyXG4gICAgICAgICAgICByZWxhdGlvbnNoaXBzOiBbXVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgIGRhdGEucmVzdWx0cy5mb3JFYWNoKGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgICAgICByZXN1bHQuZGF0YS5mb3JFYWNoKGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAgICAgICAgIGRhdGEuZ3JhcGgubm9kZXMuZm9yRWFjaChmdW5jdGlvbihub2RlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb250YWlucyhncmFwaC5ub2Rlcywgbm9kZS5pZCkpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZ3JhcGgubm9kZXMucHVzaChub2RlKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLmdyYXBoLnJlbGF0aW9uc2hpcHMuZm9yRWFjaChmdW5jdGlvbihyZWxhdGlvbnNoaXApIHtcclxuICAgICAgICAgICAgICAgICAgICByZWxhdGlvbnNoaXAuc291cmNlID0gcmVsYXRpb25zaGlwLnN0YXJ0Tm9kZTtcclxuICAgICAgICAgICAgICAgICAgICByZWxhdGlvbnNoaXAudGFyZ2V0ID0gcmVsYXRpb25zaGlwLmVuZE5vZGU7XHJcbiAgICAgICAgICAgICAgICAgICAgZ3JhcGgucmVsYXRpb25zaGlwcy5wdXNoKHJlbGF0aW9uc2hpcCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICBkYXRhLmdyYXBoLnJlbGF0aW9uc2hpcHMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGEuc291cmNlID4gYi5zb3VyY2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChhLnNvdXJjZSA8IGIuc291cmNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcclxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoYS50YXJnZXQgPiBiLnRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhLnRhcmdldCA8IGIudGFyZ2V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gMDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZGF0YS5ncmFwaC5yZWxhdGlvbnNoaXBzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgIT09IDAgJiYgZGF0YS5ncmFwaC5yZWxhdGlvbnNoaXBzW2ldLnNvdXJjZSA9PT0gZGF0YS5ncmFwaC5yZWxhdGlvbnNoaXBzW2ktMV0uc291cmNlICYmIGRhdGEuZ3JhcGgucmVsYXRpb25zaGlwc1tpXS50YXJnZXQgPT09IGRhdGEuZ3JhcGgucmVsYXRpb25zaGlwc1tpLTFdLnRhcmdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhLmdyYXBoLnJlbGF0aW9uc2hpcHNbaV0ubGlua251bSA9IGRhdGEuZ3JhcGgucmVsYXRpb25zaGlwc1tpIC0gMV0ubGlua251bSArIDE7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YS5ncmFwaC5yZWxhdGlvbnNoaXBzW2ldLmxpbmtudW0gPSAxO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHJldHVybiBncmFwaDtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkZWZhdWx0Q29sb3IoKSB7XHJcbiAgICAgICAgcmV0dXJuIG9wdGlvbnMucmVsYXRpb25zaGlwQ29sb3I7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZGVmYXVsdERhcmtlbkNvbG9yKCkge1xyXG4gICAgICAgIHJldHVybiBkMy5yZ2Iob3B0aW9ucy5jb2xvcnNbb3B0aW9ucy5jb2xvcnMubGVuZ3RoIC0gMV0pLmRhcmtlcigxKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBkcmFnRW5kZWQoZCkge1xyXG4gICAgICAgIGlmICghZDMuZXZlbnQuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHNpbXVsYXRpb24uYWxwaGFUYXJnZXQoMCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkLmZ4ID0gZC5meSA9IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhZ2dlZChkKSB7XHJcbiAgICAgICAgZC5meCA9IGQzLmV2ZW50Lng7XHJcbiAgICAgICAgZC5meSA9IGQzLmV2ZW50Lnk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZHJhZ1N0YXJ0ZWQoZCkge1xyXG4gICAgICAgIGlmICghZDMuZXZlbnQuYWN0aXZlKSB7XHJcbiAgICAgICAgICAgIHNpbXVsYXRpb24uYWxwaGFUYXJnZXQoMC4zKS5yZXN0YXJ0KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBkLmZ4ID0gZC54O1xyXG4gICAgICAgIGQuZnkgPSBkLnk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZXh0ZW5kKG9iajEsIG9iajIpIHtcclxuICAgICAgICB2YXIgb2JqID0ge307XHJcblxyXG4gICAgICAgIG1lcmdlKG9iaiwgb2JqMSk7XHJcbiAgICAgICAgbWVyZ2Uob2JqLCBvYmoyKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIG9iajtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBpY29uQ29kZShkKSB7XHJcbiAgICAgICAgdmFyIGNvZGU7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmljb25NYXAgJiYgb3B0aW9ucy5zaG93SWNvbnMgJiYgb3B0aW9ucy5pY29ucyAmJiBvcHRpb25zLmljb25zW1tkLmxhYmVsc1swXV1dICYmIG9wdGlvbnMuaWNvbk1hcFtvcHRpb25zLmljb25zW2QubGFiZWxzWzBdXV0pIHtcclxuICAgICAgICAgICAgY29kZSA9IG9wdGlvbnMuaWNvbk1hcFtvcHRpb25zLmljb25zW2QubGFiZWxzWzBdXV07XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gY29kZTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBUT0RPXHJcbiAgICBmdW5jdGlvbiBpY29ucyhzaG93SWNvbnMpIHtcclxuICAgICAgICBpZiAoc2hvd0ljb25zICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5zaG93SWNvbnMgPSBzaG93SWNvbnM7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4gb3B0aW9ucy5zaG93SWNvbnM7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdChfc2VsZWN0b3IsIF9vcHRpb25zKSB7XHJcbiAgICAgICAgT2JqZWN0LmtleXMob3B0aW9ucy5pY29uTWFwKS5mb3JFYWNoKGZ1bmN0aW9uKGtleSwgaW5kZXgpIHtcclxuICAgICAgICAgICAgdmFyIGtleXMgPSBrZXkuc3BsaXQoJywnKSxcclxuICAgICAgICAgICAgICAgIHZhbHVlID0gb3B0aW9ucy5pY29uTWFwW2tleV07XHJcbiAgICAgICAgICAgIGtleXMuZm9yRWFjaChmdW5jdGlvbihrZXkpIHtcclxuICAgICAgICAgICAgICAgIG9wdGlvbnMuaWNvbk1hcFtrZXldID0gdmFsdWU7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICBtZXJnZShvcHRpb25zLCBfb3B0aW9ucyk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmljb25zKSB7XHJcbiAgICAgICAgICAgIG9wdGlvbnMuc2hvd0ljb25zID0gdHJ1ZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghb3B0aW9ucy5taW5Db2xsaXNpb24pIHtcclxuICAgICAgICAgICAgb3B0aW9ucy5taW5Db2xsaXNpb24gPSBvcHRpb25zLm5vZGVSYWRpdXMgKiAyO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc2VsZWN0b3IgPSBfc2VsZWN0b3I7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lciA9IGQzLnNlbGVjdChzZWxlY3Rvcik7XHJcblxyXG4gICAgICAgIGNvbnRhaW5lci5hdHRyKCdjbGFzcycsICduZW80amQzJylcclxuICAgICAgICAgICAgICAgICAuaHRtbCgnJyk7XHJcblxyXG4gICAgICAgIGlmIChvcHRpb25zLmluZm9QYW5lbCkge1xyXG4gICAgICAgICAgICBpbmZvID0gYXBwZW5kSW5mbyhjb250YWluZXIpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgc3ZnID0gYXBwZW5kR3JhcGgoY29udGFpbmVyKTtcclxuXHJcbiAgICAgICAgc2ltdWxhdGlvbiA9IGluaXRTaW11bGF0aW9uKCk7XHJcblxyXG4gICAgICAgIGxvYWREYXRhKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdFNpbXVsYXRpb24oKSB7XHJcbiAgICAgICAgdmFyIHNpbXVsYXRpb24gPSBkMy5mb3JjZVNpbXVsYXRpb24oKVxyXG4vLyAgICAgICAgICAgICAgICAgICAgICAgICAgIC52ZWxvY2l0eURlY2F5KDAuOClcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAuZm9yY2UoJ3gnLCBkMy5mb3JjZSgpLnN0cmVuZ3RoKDAuMDAyKSlcclxuLy8gICAgICAgICAgICAgICAgICAgICAgICAgICAuZm9yY2UoJ3knLCBkMy5mb3JjZSgpLnN0cmVuZ3RoKDAuMDAyKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvcmNlKCdjb2xsaWRlJywgZDMuZm9yY2VDb2xsaWRlKCkucmFkaXVzKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBvcHRpb25zLm1pbkNvbGxpc2lvbjtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgfSkuaXRlcmF0aW9ucygyKSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvcmNlKCdjaGFyZ2UnLCBkMy5mb3JjZU1hbnlCb2R5KCkpXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC5mb3JjZSgnbGluaycsIGQzLmZvcmNlTGluaygpLmlkKGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBkLmlkO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICB9KSlcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLmZvcmNlKCdjZW50ZXInLCBkMy5mb3JjZUNlbnRlcihzdmcubm9kZSgpLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudC5jbGllbnRXaWR0aCAvIDIsIHN2Zy5ub2RlKCkucGFyZW50RWxlbWVudC5wYXJlbnRFbGVtZW50LmNsaWVudEhlaWdodCAvIDIpKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHNpbXVsYXRpb247XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbG9hZERhdGEoKSB7XHJcbiAgICAgICAgZDMuanNvbihvcHRpb25zLmRhdGFVcmwsIGZ1bmN0aW9uKGVycm9yLCBkYXRhKSB7XHJcbiAgICAgICAgICAgIGlmIChlcnJvcikge1xyXG4gICAgICAgICAgICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBncmFwaCA9IGRhdGEyZ3JhcGgoZGF0YSksXHJcbiAgICAgICAgICAgICAgICByZWxhdGlvbnNoaXBzID0gYXBwZW5kUmVsYXRpb25zaGlwc1RvR3JhcGgoc3ZnLCBncmFwaC5yZWxhdGlvbnNoaXBzKSxcclxuICAgICAgICAgICAgICAgIG5vZGVzID0gYXBwZW5kTm9kZXNUb0dyYXBoKHN2ZywgZ3JhcGgubm9kZXMpO1xyXG5cclxuICAgICAgICAgICAgc2ltdWxhdGlvbi5ub2RlcyhncmFwaC5ub2Rlcykub24oJ3RpY2snLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHRpY2sobm9kZXMsIHJlbGF0aW9uc2hpcHMpO1xyXG4gICAgICAgICAgICB9KS5vbignZW5kJywgZnVuY3Rpb24gKCl7XHJcbiAgICAgICAgICAgICAgICBpZiAob3B0aW9ucy56b29tRml0ICYmICFqdXN0TG9hZGVkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAganVzdExvYWRlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgem9vbUZpdCgyKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICBzaW11bGF0aW9uLmZvcmNlKCdsaW5rJykubGlua3MoZ3JhcGgucmVsYXRpb25zaGlwcyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gbWVyZ2UodGFyZ2V0LCBzb3VyY2UpIHtcclxuICAgICAgICBPYmplY3Qua2V5cyhzb3VyY2UpLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcclxuICAgICAgICAgICAgdGFyZ2V0W3Byb3BlcnR5XSA9IHNvdXJjZVtwcm9wZXJ0eV07XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcm90YXRlKGN4LCBjeSwgeCwgeSwgYW5nbGUpIHtcclxuICAgICAgICB2YXIgcmFkaWFucyA9IChNYXRoLlBJIC8gMTgwKSAqIGFuZ2xlLFxyXG4gICAgICAgICAgICBjb3MgPSBNYXRoLmNvcyhyYWRpYW5zKSxcclxuICAgICAgICAgICAgc2luID0gTWF0aC5zaW4ocmFkaWFucyksXHJcbiAgICAgICAgICAgIG54ID0gKGNvcyAqICh4IC0gY3gpKSArIChzaW4gKiAoeSAtIGN5KSkgKyBjeCxcclxuICAgICAgICAgICAgbnkgPSAoY29zICogKHkgLSBjeSkpIC0gKHNpbiAqICh4IC0gY3gpKSArIGN5O1xyXG5cclxuICAgICAgICByZXR1cm4geyB4OiBueCwgeTogbnkgfTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByb3RhdGVQb2ludChjLCBwLCBhbmdsZSkge1xyXG4gICAgICAgIHJldHVybiByb3RhdGUoYy54LCBjLnksIHAueCwgcC55LCBhbmdsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcm90YXRpb24oc291cmNlLCB0YXJnZXQpIHtcclxuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMih0YXJnZXQueSAtIHNvdXJjZS55LCB0YXJnZXQueCAtIHNvdXJjZS54KSAqIDE4MCAvIE1hdGguUEk7XHJcbiAgICB9XHJcbi8qXHJcbiAgICBmdW5jdGlvbiBzbW9vdGhUcmFuc2Zvcm0oZWxlbSwgdHJhbnNsYXRlLCBzY2FsZSkge1xyXG4gICAgICAgIHZhciBhbmltYXRpb25NaWxsaXNlY29uZHMgPSA1MDAwLFxyXG4gICAgICAgICAgICB0aW1lb3V0TWlsbGlzZWNvbmRzID0gNTAsXHJcbiAgICAgICAgICAgIHN0ZXBzID0gcGFyc2VJbnQoYW5pbWF0aW9uTWlsbGlzZWNvbmRzIC8gdGltZW91dE1pbGxpc2Vjb25kcyk7XHJcblxyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIHNtb290aFRyYW5zZm9ybVN0ZXAoZWxlbSwgdHJhbnNsYXRlLCBzY2FsZSwgdGltZW91dE1pbGxpc2Vjb25kcywgMSwgc3RlcHMpO1xyXG4gICAgICAgIH0sIHRpbWVvdXRNaWxsaXNlY29uZHMpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNtb290aFRyYW5zZm9ybVN0ZXAoZWxlbSwgdHJhbnNsYXRlLCBzY2FsZSwgdGltZW91dE1pbGxpc2Vjb25kcywgc3RlcCwgc3RlcHMpIHtcclxuICAgICAgICB2YXIgcHJvZ3Jlc3MgPSBzdGVwIC8gc3RlcHM7XHJcblxyXG4gICAgICAgIGVsZW0uYXR0cigndHJhbnNmb3JtJywgJ3RyYW5zbGF0ZSgnICsgKHRyYW5zbGF0ZVswXSAqIHByb2dyZXNzKSArICcsICcgKyAodHJhbnNsYXRlWzFdICogcHJvZ3Jlc3MpICsgJykgc2NhbGUoJyArIChzY2FsZSAqIHByb2dyZXNzKSArICcpJyk7XHJcblxyXG4gICAgICAgIGlmIChzdGVwIDwgc3RlcHMpIHtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHNtb290aFRyYW5zZm9ybVN0ZXAoZWxlbSwgdHJhbnNsYXRlLCBzY2FsZSwgdGltZW91dE1pbGxpc2Vjb25kcywgc3RlcCArIDEsIHN0ZXBzKTtcclxuICAgICAgICAgICAgfSwgdGltZW91dE1pbGxpc2Vjb25kcyk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4qL1xyXG4gICAgZnVuY3Rpb24gdGljayhub2RlcywgcmVsYXRpb25zaGlwcykge1xyXG4gICAgICAgIHRpY2tOb2Rlcyhub2Rlcyk7XHJcbiAgICAgICAgdGlja1JlbGF0aW9uc2hpcHMocmVsYXRpb25zaGlwcyk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGlja05vZGVzKG5vZGVzKSB7XHJcbiAgICAgICAgbm9kZXMuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJ3RyYW5zbGF0ZSgnICsgZC54ICsgJywgJyArIGQueSArICcpJztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0aWNrUmVsYXRpb25zaGlwcyhyZWxhdGlvbnNoaXBzKSB7XHJcbiAgICAgICAgcmVsYXRpb25zaGlwcy5yZWxhdGlvbnNoaXBzLmF0dHIoJ3RyYW5zZm9ybScsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgdmFyIGFuZ2xlID0gcm90YXRpb24oZC5zb3VyY2UsIGQudGFyZ2V0KTtcclxuICAgICAgICAgICAgcmV0dXJuICd0cmFuc2xhdGUoJyArIGQuc291cmNlLnggKyAnLCAnICsgZC5zb3VyY2UueSArICcpIHJvdGF0ZSgnICsgYW5nbGUgKyAnKSc7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHRpY2tSZWxhdGlvbnNoaXBzVGV4dHMocmVsYXRpb25zaGlwcy50ZXh0cywgcmVsYXRpb25zaGlwcy5yZWxhdGlvbnNoaXBzKTtcclxuICAgICAgICB0aWNrUmVsYXRpb25zaGlwc091dGxpbmVzKHJlbGF0aW9uc2hpcHMucmVsYXRpb25zaGlwcyk7XHJcbiAgICAgICAgdGlja1JlbGF0aW9uc2hpcHNPdmVybGF5cyhyZWxhdGlvbnNoaXBzLm92ZXJsYXlzKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0aWNrUmVsYXRpb25zaGlwc091dGxpbmVzKHJlbGF0aW9uc2hpcHMpIHtcclxuICAgICAgICByZWxhdGlvbnNoaXBzLmVhY2goZnVuY3Rpb24ocmVsYXRpb25zaGlwKSB7XHJcbiAgICAgICAgICAgIHZhciByZWwgPSBkMy5zZWxlY3QodGhpcyksXHJcbiAgICAgICAgICAgICAgICBvdXRsaW5lID0gcmVsLnNlbGVjdCgnLm91dGxpbmUnKSxcclxuICAgICAgICAgICAgICAgIHRleHQgPSByZWwuc2VsZWN0KCcudGV4dCcpLFxyXG4gICAgICAgICAgICAgICAgYmJveCA9IHRleHQubm9kZSgpLmdldEJCb3goKSxcclxuICAgICAgICAgICAgICAgIHBhZGRpbmcgPSAzO1xyXG5cclxuICAgICAgICAgICAgb3V0bGluZS5hdHRyKCdkJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgdmFyIGNlbnRlciA9IHsgeDogMCwgeTogMCB9LFxyXG4gICAgICAgICAgICAgICAgICAgIGFuZ2xlID0gcm90YXRpb24oZC5zb3VyY2UsIGQudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgICAgICB0ZXh0Qm91bmRpbmdCb3ggPSB0ZXh0Lm5vZGUoKS5nZXRCQm94KCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dFBhZGRpbmcgPSA1LFxyXG4gICAgICAgICAgICAgICAgICAgIHUgPSB1bml0YXJ5VmVjdG9yKGQuc291cmNlLCBkLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dE1hcmdpbiA9IHsgeDogKGQudGFyZ2V0LnggLSBkLnNvdXJjZS54IC0gKHRleHRCb3VuZGluZ0JveC53aWR0aCArIHRleHRQYWRkaW5nKSAqIHUueCkgKiAwLjUsIHk6IChkLnRhcmdldC55IC0gZC5zb3VyY2UueSAtICh0ZXh0Qm91bmRpbmdCb3gud2lkdGggKyB0ZXh0UGFkZGluZykgKiB1LnkpICogMC41IH0sXHJcbiAgICAgICAgICAgICAgICAgICAgbiA9IHVuaXRhcnlOb3JtYWxWZWN0b3IoZC5zb3VyY2UsIGQudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnRBMSA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiAwICsgKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS54IC0gbi54LCB5OiAwICsgKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS55IC0gbi55IH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnRCMSA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiB0ZXh0TWFyZ2luLnggLSBuLngsIHk6IHRleHRNYXJnaW4ueSAtIG4ueSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50QzEgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogdGV4dE1hcmdpbi54LCB5OiB0ZXh0TWFyZ2luLnkgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEQxID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IDAgKyAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LngsIHk6IDAgKyAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnkgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEEyID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IGQudGFyZ2V0LnggLSBkLnNvdXJjZS54IC0gdGV4dE1hcmdpbi54IC0gbi54LCB5OiBkLnRhcmdldC55IC0gZC5zb3VyY2UueSAtIHRleHRNYXJnaW4ueSAtIG4ueSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50QjIgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnggLSBuLnggLSB1LnggKiBvcHRpb25zLmFycm93U2l6ZSwgeTogZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnkgLSBuLnkgLSB1LnkgKiBvcHRpb25zLmFycm93U2l6ZSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50QzIgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnggLSBuLnggKyAobi54IC0gdS54KSAqIG9wdGlvbnMuYXJyb3dTaXplLCB5OiBkLnRhcmdldC55IC0gZC5zb3VyY2UueSAtIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueSAtIG4ueSArIChuLnkgLSB1LnkpICogb3B0aW9ucy5hcnJvd1NpemUgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEQyID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IGQudGFyZ2V0LnggLSBkLnNvdXJjZS54IC0gKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS54LCB5OiBkLnRhcmdldC55IC0gZC5zb3VyY2UueSAtIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50RTIgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnggKyAoLSBuLnggLSB1LngpICogb3B0aW9ucy5hcnJvd1NpemUsIHk6IGQudGFyZ2V0LnkgLSBkLnNvdXJjZS55IC0gKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS55ICsgKC0gbi55IC0gdS55KSAqIG9wdGlvbnMuYXJyb3dTaXplIH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnRGMiA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiBkLnRhcmdldC54IC0gZC5zb3VyY2UueCAtIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueCAtIHUueCAqIG9wdGlvbnMuYXJyb3dTaXplLCB5OiBkLnRhcmdldC55IC0gZC5zb3VyY2UueSAtIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueSAtIHUueSAqIG9wdGlvbnMuYXJyb3dTaXplIH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnRHMiA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiBkLnRhcmdldC54IC0gZC5zb3VyY2UueCAtIHRleHRNYXJnaW4ueCwgeTogZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSB0ZXh0TWFyZ2luLnkgfSwgYW5nbGUpO1xyXG5cclxuICAgICAgICAgICAgICAgIHJldHVybiAnTSAnICsgcm90YXRlZFBvaW50QTEueCArICcgJyArIHJvdGF0ZWRQb2ludEExLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50QjEueCArICcgJyArIHJvdGF0ZWRQb2ludEIxLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50QzEueCArICcgJyArIHJvdGF0ZWRQb2ludEMxLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50RDEueCArICcgJyArIHJvdGF0ZWRQb2ludEQxLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgWiBNICcgKyByb3RhdGVkUG9pbnRBMi54ICsgJyAnICsgcm90YXRlZFBvaW50QTIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRCMi54ICsgJyAnICsgcm90YXRlZFBvaW50QjIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRDMi54ICsgJyAnICsgcm90YXRlZFBvaW50QzIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnREMi54ICsgJyAnICsgcm90YXRlZFBvaW50RDIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRFMi54ICsgJyAnICsgcm90YXRlZFBvaW50RTIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRGMi54ICsgJyAnICsgcm90YXRlZFBvaW50RjIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRHMi54ICsgJyAnICsgcm90YXRlZFBvaW50RzIueSArXHJcbiAgICAgICAgICAgICAgICAgICAgICAgJyBaJztcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdGlja1JlbGF0aW9uc2hpcHNPdXRsaW5lc09sZChyZWxhdGlvbnNoaXBzKSB7XHJcbiAgICAgICAgcmVsYXRpb25zaGlwcy5lYWNoKGZ1bmN0aW9uKHJlbGF0aW9uc2hpcCkge1xyXG4gICAgICAgICAgICB2YXIgcmVsID0gZDMuc2VsZWN0KHRoaXMpLFxyXG4gICAgICAgICAgICAgICAgb3V0bGluZSA9IHJlbC5zZWxlY3QoJy5vdXRsaW5lJyksXHJcbiAgICAgICAgICAgICAgICB0ZXh0ID0gcmVsLnNlbGVjdCgnLnRleHQnKSxcclxuICAgICAgICAgICAgICAgIGJib3ggPSB0ZXh0Lm5vZGUoKS5nZXRCQm94KCksXHJcbiAgICAgICAgICAgICAgICBwYWRkaW5nID0gMztcclxuXHJcbiAgICAgICAgICAgIG91dGxpbmUuYXR0cignZCcsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgICAgIHZhciBjZW50ZXIgPSB7IHg6IDAsIHk6IDAgfSxcclxuICAgICAgICAgICAgICAgICAgICBhbmdsZSA9IHJvdGF0aW9uKGQuc291cmNlLCBkLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICAgICAgdGV4dEJvdW5kaW5nQm94ID0gdGV4dC5ub2RlKCkuZ2V0QkJveCgpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRQYWRkaW5nID0gNSxcclxuICAgICAgICAgICAgICAgICAgICB1ID0gdW5pdGFyeVZlY3RvcihkLnNvdXJjZSwgZC50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgICAgIHRleHRNYXJnaW4gPSB7IHg6IChkLnRhcmdldC54IC0gZC5zb3VyY2UueCAtICh0ZXh0Qm91bmRpbmdCb3gud2lkdGggKyB0ZXh0UGFkZGluZykgKiB1LngpICogMC41LCB5OiAoZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSAodGV4dEJvdW5kaW5nQm94LndpZHRoICsgdGV4dFBhZGRpbmcpICogdS55KSAqIDAuNSB9LFxyXG4gICAgICAgICAgICAgICAgICAgIG4gPSB1bml0YXJ5Tm9ybWFsVmVjdG9yKGQuc291cmNlLCBkLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50QTEgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogMCArIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueCAtIG4ueCwgeTogMCArIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueSAtIG4ueSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50QjEgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogdGV4dE1hcmdpbi54IC0gbi54LCB5OiB0ZXh0TWFyZ2luLnkgLSBuLnkgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEMxID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IHRleHRNYXJnaW4ueCwgeTogdGV4dE1hcmdpbi55IH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnREMSA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiAwICsgKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS54LCB5OiAwICsgKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS55IH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnRBMiA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiBkLnRhcmdldC54IC0gZC5zb3VyY2UueCAtIHRleHRNYXJnaW4ueCAtIG4ueCwgeTogZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSB0ZXh0TWFyZ2luLnkgLSBuLnkgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEIyID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IGQudGFyZ2V0LnggLSBkLnNvdXJjZS54IC0gKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS54IC0gbi54IC0gdS54ICogb3B0aW9ucy5hcnJvd1NpemUsIHk6IGQudGFyZ2V0LnkgLSBkLnNvdXJjZS55IC0gKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS55IC0gbi55IC0gdS55ICogb3B0aW9ucy5hcnJvd1NpemUgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEMyID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IGQudGFyZ2V0LnggLSBkLnNvdXJjZS54IC0gKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS54IC0gbi54ICsgKG4ueCAtIHUueCkgKiBvcHRpb25zLmFycm93U2l6ZSwgeTogZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnkgLSBuLnkgKyAobi55IC0gdS55KSAqIG9wdGlvbnMuYXJyb3dTaXplIH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgICAgICByb3RhdGVkUG9pbnREMiA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiBkLnRhcmdldC54IC0gZC5zb3VyY2UueCAtIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueCwgeTogZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnkgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEUyID0gcm90YXRlUG9pbnQoY2VudGVyLCB7IHg6IGQudGFyZ2V0LnggLSBkLnNvdXJjZS54IC0gKG9wdGlvbnMubm9kZVJhZGl1cyArIDEpICogdS54ICsgKC0gbi54IC0gdS54KSAqIG9wdGlvbnMuYXJyb3dTaXplLCB5OiBkLnRhcmdldC55IC0gZC5zb3VyY2UueSAtIChvcHRpb25zLm5vZGVSYWRpdXMgKyAxKSAqIHUueSArICgtIG4ueSAtIHUueSkgKiBvcHRpb25zLmFycm93U2l6ZSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50RjIgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnggLSB1LnggKiBvcHRpb25zLmFycm93U2l6ZSwgeTogZC50YXJnZXQueSAtIGQuc291cmNlLnkgLSAob3B0aW9ucy5ub2RlUmFkaXVzICsgMSkgKiB1LnkgLSB1LnkgKiBvcHRpb25zLmFycm93U2l6ZSB9LCBhbmdsZSksXHJcbiAgICAgICAgICAgICAgICAgICAgcm90YXRlZFBvaW50RzIgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggLSB0ZXh0TWFyZ2luLngsIHk6IGQudGFyZ2V0LnkgLSBkLnNvdXJjZS55IC0gdGV4dE1hcmdpbi55IH0sIGFuZ2xlKTtcclxuXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gJ00gJyArIHJvdGF0ZWRQb2ludEExLnggKyAnICcgKyByb3RhdGVkUG9pbnRBMS55ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnIEwgJyArIHJvdGF0ZWRQb2ludEIxLnggKyAnICcgKyByb3RhdGVkUG9pbnRCMS55ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnIEwgJyArIHJvdGF0ZWRQb2ludEMxLnggKyAnICcgKyByb3RhdGVkUG9pbnRDMS55ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnIEwgJyArIHJvdGF0ZWRQb2ludEQxLnggKyAnICcgKyByb3RhdGVkUG9pbnREMS55ICtcclxuICAgICAgICAgICAgICAgICAgICAgICAnIFogTSAnICsgcm90YXRlZFBvaW50QTIueCArICcgJyArIHJvdGF0ZWRQb2ludEEyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50QjIueCArICcgJyArIHJvdGF0ZWRQb2ludEIyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50QzIueCArICcgJyArIHJvdGF0ZWRQb2ludEMyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50RDIueCArICcgJyArIHJvdGF0ZWRQb2ludEQyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50RTIueCArICcgJyArIHJvdGF0ZWRQb2ludEUyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50RjIueCArICcgJyArIHJvdGF0ZWRQb2ludEYyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgTCAnICsgcm90YXRlZFBvaW50RzIueCArICcgJyArIHJvdGF0ZWRQb2ludEcyLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgICAgICcgWic7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRpY2tSZWxhdGlvbnNoaXBzT3ZlcmxheXMob3ZlcmxheXMpIHtcclxuICAgICAgICBvdmVybGF5cy5hdHRyKCdkJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICB2YXIgY2VudGVyID0geyB4OiAwLCB5OiAwIH0sXHJcbiAgICAgICAgICAgICAgICBhbmdsZSA9IHJvdGF0aW9uKGQuc291cmNlLCBkLnRhcmdldCksXHJcbiAgICAgICAgICAgICAgICBuMSA9IHVuaXRhcnlOb3JtYWxWZWN0b3IoZC5zb3VyY2UsIGQudGFyZ2V0KSxcclxuICAgICAgICAgICAgICAgIG4gPSB1bml0YXJ5Tm9ybWFsVmVjdG9yKGQuc291cmNlLCBkLnRhcmdldCwgNTApLFxyXG4gICAgICAgICAgICAgICAgcm90YXRlZFBvaW50QSA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiAwIC0gbi54LCB5OiAwIC0gbi55IH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEIgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggLSBuLngsIHk6IGQudGFyZ2V0LnkgLSBkLnNvdXJjZS55IC0gbi55IH0sIGFuZ2xlKSxcclxuICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludEMgPSByb3RhdGVQb2ludChjZW50ZXIsIHsgeDogZC50YXJnZXQueCAtIGQuc291cmNlLnggKyBuLnggLSBuMS54LCB5OiBkLnRhcmdldC55IC0gZC5zb3VyY2UueSArIG4ueSAtIG4xLnkgfSwgYW5nbGUpLFxyXG4gICAgICAgICAgICAgICAgcm90YXRlZFBvaW50RCA9IHJvdGF0ZVBvaW50KGNlbnRlciwgeyB4OiAwICsgbi54IC0gbjEueCwgeTogMCArIG4ueSAtIG4xLnkgfSwgYW5nbGUpO1xyXG5cclxuICAgICAgICAgICAgcmV0dXJuICdNICcgKyByb3RhdGVkUG9pbnRBLnggKyAnICcgKyByb3RhdGVkUG9pbnRBLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRCLnggKyAnICcgKyByb3RhdGVkUG9pbnRCLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRDLnggKyAnICcgKyByb3RhdGVkUG9pbnRDLnkgK1xyXG4gICAgICAgICAgICAgICAgICAgJyBMICcgKyByb3RhdGVkUG9pbnRELnggKyAnICcgKyByb3RhdGVkUG9pbnRELnkgK1xyXG4gICAgICAgICAgICAgICAgICAgJyBaJztcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB0aWNrUmVsYXRpb25zaGlwc1RleHRzKHRleHRzLCByZWxhdGlvbnNoaXBzKSB7XHJcbiAgICAgICAgdGV4dHMuYXR0cigndHJhbnNmb3JtJywgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICB2YXIgYW5nbGUgPSAocm90YXRpb24oZC5zb3VyY2UsIGQudGFyZ2V0KSArIDM2MCkgJSAzNjAsXHJcbiAgICAgICAgICAgICAgICBtaXJyb3IgPSBhbmdsZSA+IDkwICYmIGFuZ2xlIDwgMjcwLFxyXG4gICAgICAgICAgICAgICAgY2VudGVyID0geyB4OiAwLCB5OiAwIH0sXHJcbiAgICAgICAgICAgICAgICBuID0gdW5pdGFyeU5vcm1hbFZlY3RvcihkLnNvdXJjZSwgZC50YXJnZXQpLFxyXG4gICAgICAgICAgICAgICAgbldlaWdodCA9IG1pcnJvciA/IDIgOiAtMyxcclxuICAgICAgICAgICAgICAgIHBvaW50ID0geyB4OiAoZC50YXJnZXQueCAtIGQuc291cmNlLngpICogMC41ICsgbi54ICogbldlaWdodCwgeTogKGQudGFyZ2V0LnkgLSBkLnNvdXJjZS55KSAqIDAuNSArIG4ueSAqIG5XZWlnaHQgfSxcclxuICAgICAgICAgICAgICAgIHJvdGF0ZWRQb2ludCA9IHJvdGF0ZVBvaW50KGNlbnRlciwgcG9pbnQsIGFuZ2xlKTtcclxuXHJcbiAgICAgICAgICAgIHJldHVybiAndHJhbnNsYXRlKCcgKyByb3RhdGVkUG9pbnQueCArICcsICcgKyByb3RhdGVkUG9pbnQueSArICcpIHJvdGF0ZSgnICsgKG1pcnJvciA/IDE4MCA6IDApICsgJyknO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHRvU3RyaW5nKGQpIHtcclxuICAgICAgICB2YXIgcyA9IGQubGFiZWxzID8gZC5sYWJlbHNbMF0gOiBkLnR5cGU7XHJcblxyXG4gICAgICAgIHMgKz0gJyAoPGlkPjogJyArIGQuaWQ7XHJcblxyXG4gICAgICAgIE9iamVjdC5rZXlzKGQucHJvcGVydGllcykuZm9yRWFjaChmdW5jdGlvbihwcm9wZXJ0eSkge1xyXG4gICAgICAgICAgICBzICs9ICcsICcgKyBwcm9wZXJ0eSArICc6ICcgKyBKU09OLnN0cmluZ2lmeShkLnByb3BlcnRpZXNbcHJvcGVydHldKTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgcyArPSAnKSc7XHJcblxyXG4gICAgICAgIHJldHVybiBzO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHVuaXRhcnlOb3JtYWxWZWN0b3Ioc291cmNlLCB0YXJnZXQsIG5ld0xlbmd0aCkge1xyXG4gICAgICAgIHZhciBjZW50ZXIgPSB7IHg6IDAsIHk6IDAgfSxcclxuICAgICAgICAgICAgdmVjdG9yID0gdW5pdGFyeVZlY3Rvcihzb3VyY2UsIHRhcmdldCwgbmV3TGVuZ3RoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHJvdGF0ZVBvaW50KGNlbnRlciwgdmVjdG9yLCA5MCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdW5pdGFyeVZlY3Rvcihzb3VyY2UsIHRhcmdldCwgbmV3TGVuZ3RoKSB7XHJcbiAgICAgICAgdmFyIGxlbmd0aCA9IE1hdGguc3FydChNYXRoLnBvdyh0YXJnZXQueCAtIHNvdXJjZS54LCAyKSArIE1hdGgucG93KHRhcmdldC55IC0gc291cmNlLnksIDIpKSAvIE1hdGguc3FydChuZXdMZW5ndGggfHwgMSk7XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIHg6ICh0YXJnZXQueCAtIHNvdXJjZS54KSAvIGxlbmd0aCxcclxuICAgICAgICAgICAgeTogKHRhcmdldC55IC0gc291cmNlLnkpIC8gbGVuZ3RoLFxyXG4gICAgICAgIH07XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlSW5mbyhkKSB7XHJcbiAgICAgICAgY2xlYXJJbmZvKCk7XHJcblxyXG4gICAgICAgIGlmIChkLmxhYmVscykge1xyXG4gICAgICAgICAgICBhcHBlbmRJbmZvRWxlbWVudE5vZGUoJ2luZm8nLCBkLmxhYmVsc1swXSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXBwZW5kSW5mb0VsZW1lbnRSZWxhdGlvbnNoaXAoJ2luZm8nLCBkLnR5cGUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgYXBwZW5kSW5mb0VsZW1lbnRQcm9wZXJ0eSgnYnRuLWRlZmF1bHQnLCAnJmx0O2lkJmd0OycsIGQuaWQpO1xyXG5cclxuICAgICAgICBPYmplY3Qua2V5cyhkLnByb3BlcnRpZXMpLmZvckVhY2goZnVuY3Rpb24ocHJvcGVydHkpIHtcclxuICAgICAgICAgICAgYXBwZW5kSW5mb0VsZW1lbnRQcm9wZXJ0eSgnYnRuLWRlZmF1bHQnLCBwcm9wZXJ0eSwgSlNPTi5zdHJpbmdpZnkoZC5wcm9wZXJ0aWVzW3Byb3BlcnR5XSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHpvb21GaXQodHJhbnNpdGlvbkR1cmF0aW9uKSB7XHJcbiAgICAgICAgdmFyIGJvdW5kcyA9IHN2Zy5ub2RlKCkuZ2V0QkJveCgpLFxyXG4gICAgICAgICAgICBwYXJlbnQgPSBzdmcubm9kZSgpLnBhcmVudEVsZW1lbnQucGFyZW50RWxlbWVudCxcclxuICAgICAgICAgICAgZnVsbFdpZHRoID0gcGFyZW50LmNsaWVudFdpZHRoLFxyXG4gICAgICAgICAgICBmdWxsSGVpZ2h0ID0gcGFyZW50LmNsaWVudEhlaWdodCxcclxuICAgICAgICAgICAgd2lkdGggPSBib3VuZHMud2lkdGgsXHJcbiAgICAgICAgICAgIGhlaWdodCA9IGJvdW5kcy5oZWlnaHQsXHJcbiAgICAgICAgICAgIG1pZFggPSBib3VuZHMueCArIHdpZHRoIC8gMixcclxuICAgICAgICAgICAgbWlkWSA9IGJvdW5kcy55ICsgaGVpZ2h0IC8gMjtcclxuXHJcbiAgICAgICAgaWYgKHdpZHRoID09PSAwIHx8IGhlaWdodCA9PT0gMCkge1xyXG4gICAgICAgICAgICByZXR1cm47IC8vIG5vdGhpbmcgdG8gZml0XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBzdmdTY2FsZSA9IDAuODUgLyBNYXRoLm1heCh3aWR0aCAvIGZ1bGxXaWR0aCwgaGVpZ2h0IC8gZnVsbEhlaWdodCk7XHJcbiAgICAgICAgc3ZnVHJhbnNsYXRlID0gW2Z1bGxXaWR0aCAvIDIgLSBzdmdTY2FsZSAqIG1pZFgsIGZ1bGxIZWlnaHQgLyAyIC0gc3ZnU2NhbGUgKiBtaWRZXTtcclxuXHJcbiAgICAgICAgc3ZnLmF0dHIoJ3RyYW5zZm9ybScsICd0cmFuc2xhdGUoJyArIHN2Z1RyYW5zbGF0ZVswXSArICcsICcgKyBzdmdUcmFuc2xhdGVbMV0gKyAnKSBzY2FsZSgnICsgc3ZnU2NhbGUgKyAnKScpO1xyXG4vLyAgICAgICAgc21vb3RoVHJhbnNmb3JtKHN2Zywgc3ZnVHJhbnNsYXRlLCBzdmdTY2FsZSk7XHJcbiAgICB9XG5cclxuICAgIC8vIFRPRE9cclxuICAgIGZ1bmN0aW9uIHpvb21JbigpIHtcclxuICAgICAgICAvLyBodHRwOi8vYmwub2Nrcy5vcmcvbGluc3Nlbi83MzUyODEwXHJcbiAgICAgICAgY29uc29sZS5lcnJvcignem9vbUluJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVE9ET1xyXG4gICAgZnVuY3Rpb24gem9vbU91dCgpIHtcclxuICAgICAgICAvLyBodHRwOi8vYmwub2Nrcy5vcmcvbGluc3Nlbi83MzUyODEwXHJcbiAgICAgICAgY29uc29sZS5lcnJvcignem9vbU91dCcpO1xyXG4gICAgfVxyXG5cclxuICAgIGluaXQoX3NlbGVjdG9yLCBfb3B0aW9ucyk7XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBpY29uczogaWNvbnMsXHJcbiAgICAgICAgdmVyc2lvbjogdmVyc2lvbixcclxuICAgICAgICB6b29tSW46IHpvb21JbixcclxuICAgICAgICB6b29tT3V0OiB6b29tT3V0XHJcbiAgICB9O1xyXG59XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IE5lbzRqRDM7XHJcbiJdfQ==
