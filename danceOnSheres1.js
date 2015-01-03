var world = animatrix.world(),
    container = world.add(document.querySelector("#animatrix-world")),
    cards = [],
    card_id,
    is_user_activity = false,
    items_count = 70,
//    screen_width = window.innerWidth,
//    screen_height = window.innerHeight,
//    h_width = screen_width >> 1,
//    h_height = screen_height >> 1,
    layers_opacity = {
        o0: 1,
        o1: 1,
        o2: 1,
        o3: .4
    },
    keys = {
        UP: 38,
        DOWN: 40,
        LEFT: 37,
        RIGHT: 39,
        w: 87,
        s: 83,
        d: 68,
        a: 65,
        q: 81,
        r: 82,
        z: 90
    },
    animatrix_card_timeout,
    card_html,
    img,
    card,
    i,
    start_position,
    d,
    t,
    m;
console.log(world); 

function initItemsPosition(items_count) {
    // Если вводишь новую переменную, то дабавляй ее к блоку нижу (var ...)
    // Или пиши перед ней, когда она первый раз появляется в коде, слово var
    // Если этого не делать, переменные становятся глобальными и могут создать проблемы
    var fluctuation_z = 1,
        layers_count = 4,
		width = window.innerWidth,
        height = window.innerHeight,
        list = [],
        z0 = 1 * width,//move for 0 layer.
		z_step = 450, // step between layers along Z.
		t, i, j, k,
        x, y, z, h, u,
        v = 0;
		
    for (k = 0; k < 5; k++) {
        
		t = Math.max(items_count/layers_count, Math.floor(k / (layers_count - 1)) * (items_count - v)); //count of foto in the layer
        u = width / (t + 1); // size of step along X
		h = height / 4; // size of step along Y
        v = v + t;
        for (j = 0; j < 1; j++) {
            for (i = 0; i < 14; i++) {
                
				 x = Math.cos(i * (Math.PI / 8)) * Math.cos(1 * (Math.PI / 4)) * (k +1) * width / 4 , //-width / 2 ;//((((1 * i) + 0 )  + k % 4) * Math.pow(-1, i) - 0)  * u//x = (i + 1) * Math.pow(-1, i) * u;
                y = (-1) * Math.cos(1 * (Math.PI / 4)) * Math.sin(i * (Math.PI / 8)) * (k +1) * width / 4;//(j + 1 - k * (1 / 3.5)) * Math.pow(-1, j) * h;
                z = Math.sin(1 * (Math.PI / 4)) * (k +1) * width / 4 - z0//(-z_step) * k - z0 - fluctuation_z * (i + (t / 2) * j ) * Math.pow(-1, i) ;  
                 
				//console.log(x,y,z,k);
                list.push([x, y, z, k]);
            }
        }
    }
    return list;
    
}


//целое случайное число в инетрвале [min, max]
function rand(min, max) {
    return Math.floor(min + Math.random() * (max + 1 - min));
}
function placeItemsOnLayer(items_count, z_coord, layer_number)  {
        var fluctuation_z = 1,
            items_count,

            width = window.innerWidth,
            height = window.innerHeight,
            colums_strings_proportion = 1,
            fake_screen_koef = 1,//((-z_coord) + 300)/300,//коэффициент растяжки размеров  прямоугольника локации елементов(items).
			list = [],

            t, r, q, u, h, i, j, k,
            v, s = 0,
            x, y, z;

        u = width / items_count; // size of step along X
		h = height / 4; // size of step along Y
       
        for (j = 0; j < 2; j++) {
            for (i = 0; i < items_count / 2; i++) {
                
				x = (i + 1) * Math.pow(-1, i) * u * fake_screen_koef;
                y = (j + 1 - ((layer_number + 2) % 4) * (1 / 3.5)) * Math.pow(-1, j) * h * fake_screen_koef;
				z =  -(z_coord + fluctuation_z * (i + Math.floor(items_count / 2) * j ));


                list.push([x, y, z, layer_number]);
                //console.log(x,y,z)
            }
        }
        return list;
    }
	z_coord = 1200;
	layer_number = 5 ;
	function shere() {
	    return container.animate({
    rotate: [0, 0, 1080]
}, 250000);
	}
// translate массив для карточки.
function randItemTranslate(card_state_translate, world_state) {
    var width = window.innerWidth,
        height = window.innerHeight,
        h_width = width >> 1, // пол экрана
        h_height = height >> 1,
        behind_screen = rand(400, 600), //на сколько пикселей карта может убегать "за экран"
        min_distance = 200, //минимальное расстояние на которое может переместиться карта
        animation = {
            translate: [0, 0, 0],
            duration: rand(1700, 4500) * (is_user_activity ? 35 : 1),
            delay: rand(0, 1) ? rand(2400, 8000) : 0
        },
        axis_to_move = rand(0, 1), // 0 двигаю по x , 1 по y
        distance;
    // TODO привязаться к положению мира (вдруг весь мир сдвинут)
    if (axis_to_move) {
        // ось Y
        if (Math.abs(card_state_translate[axis_to_move]) > h_height + behind_screen) {
            // если элемент за экраном - двигаю в противоположную сторону
            distance = rand(min_distance, height + behind_screen);
            distance = card_state_translate[axis_to_move] > 0 ? distance * (-1) : distance;
        } else {
            // элемент не за экраном  - двигаю в случайную сторону
            distance = rand(min_distance, h_height + behind_screen) * (rand(0, 1) ? (-1) : 1);
        }
    } else {
        // ось X
        if (Math.abs(card_state_translate[axis_to_move]) > h_width + behind_screen) {
            // если элемент за экраном - двигаю в противоположную сторону
            distance = rand(min_distance, width + behind_screen);
            distance = card_state_translate[axis_to_move] > 0 ? distance * (-1) : distance;
        } else {
            // элемент не за экраном  - двигаю в случайную сторону (чуть больше чем по верт оси
            distance = rand(min_distance, h_width + behind_screen + behind_screen / 2) * (rand(0, 1) ? (-1) : 1);
        }
    }
    animation.translate[axis_to_move] = distance;
    return animation;
}


start_position = initItemsPosition(items_count);// placeItemsOnLayer(items_count, z_coord, layer_number);

for (i = 0; i < items_count; i++) {
    card_html = document.createElement('div');
    card_html.className = 'animatrix-card';

    //img = document.createElement('img');
    //img.setAttribute('src', 'img/' + (i + 1).toString() + '.png');
    //card_html.appendChild(img);

    card_id = document.createElement('div');
    card_id.className = 'animatrix-card-id';
    card_id.innerText = i;
    card_html.appendChild(card_id);

    card = world.add(card_html);
    card.translate([start_position[i][0], start_position[i][1], start_position[i][2]]);
    card.state.opacity = layers_opacity['o' + start_position[i][3]];
//shere();
    //500мсек на месте. никуда не двигаясь. потом побежали
    card.animate(/*{rotate: [0, 0, 360]},3000)*/{translate: [0, 0, 0]}, 500)
        .on('end', function () {
            this.animate(shere());//this.animate(randItemTranslate(this.item.state.translate));
        });

    card_html.addEventListener('click', function (card) {
//        console.log('!!!!!!!!!!');
//        console.log(card);
//        card.pause();
//        card
//        return function (e) {
//            if (item.running) {
//                item.pause()
//            } else {
//                item.resume()
//            }
//        }
    }(card), false);

    cards.push(card);

    container.dom.appendChild(card_html);
}

// стартовый поворот контейнера
//container.animate({
    //rotate: [0, 0, 360]
//}, 60000);
//world.pause();

addEventListener('keydown', onKeyDown, true);
addEventListener('keyup', function (e) {
    if (e.keyCode !== keys.r) {
        container.stop()
    }
}, true);
addEventListener('mousemove', slowDownCards, true);
addEventListener('wheel', mouseWheel, true);

function mouseWheel (e) {
    var direction = e.deltaY > 0 ? 'down' : 'up';

    if (!container.animation.length) {
        if (direction === 'up') {
            container.animate({translate: [0, 0, 300]}, 800)
        } else {
            container.animate({translate: [0, 0, -300]}, 800);
        }
    }


//    if (e.deltaY > 0) {
//        direction = 'up';
//    } else {
//        direction = 'down'
//    }
//    console.log('asdfasdf');
//    console.log(direction);
}

function slowDownCards(e) {
    if (!is_user_activity) {
        is_user_activity = true;
        cards.forEach(function (el) {
            el.stop();
        });
    }

    clearTimeout(animatrix_card_timeout);
    animatrix_card_timeout = window.setTimeout(function () {
        is_user_activity = false;
        cards.forEach(function (el) {
            el.stop();
        });
    }, 5000);
}

function onKeyDown(e) {
    var rotate = [0, 0, 0],
        translate = [0, 0, 0],
        rotate_state = container.state.rotate[1];

    function animateContainer() {
        if (container.animation.length) {
        } else {
            // если никакая анимация не крутится - погнали
            container.animate({
                translate: translate,
                rotate: rotate
            }, 500)
        }
    }

    slowDownCards();

    switch (e.keyCode) {
        case keys.UP:
            translate[1] = 1300;
            animateContainer();
            break;
        case keys.DOWN:
            translate[1] = -1300;
            animateContainer();
            break;
        case keys.LEFT:
            translate[0] = -1300;
            animateContainer();
            break;
        case keys.RIGHT:
            translate[0] = 1300;
            animateContainer();
            break;
        case keys.q:
            if (rotate_state >= -90) {
                rotate[2] = -(90 + rotate_state);
            }
            animateContainer();
            break;
        case keys.d:
            if (rotate_state <= 90) {
                rotate[2] = 90 - rotate_state;
            }
            animateContainer();
           // break;
        case keys.r:
            rotate[2] = 0 - rotate_state;
            animateContainer();
            break;
        case keys.s:
            mouseWheel({deltaY: -1});
            break;
        case keys.z:
            mouseWheel({deltaY: 1});
            break;
    }

}