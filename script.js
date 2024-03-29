let local_user_name = "";
let help_page = 0;

function get_user_name() {
    if (local_user_name === "" &&
        window.localStorage &&
        window.localStorage.nick) {
        local_user_name = window.localStorage.nick;
    }
    return local_user_name;
}

function set_user_name(name) {
    local_user_name = name;
    if (window.localStorage) {
        window.localStorage.nick = name;
    }
}

function send_replay() {

}



/* 0xC8, size 0x44; offsets: [6]
0		0x0C8	subject_professor_names
0x11	0x0D9	subject_titles
0x32    0x0FA
0x34    0x0FC
0x36    0x0FE	subject_tasks
0x38    0x100
0x3A	0x102	subject_exam_days
0x3C    0x104	subject_exam_min_time
0x3E    0x106	subject_exam_max_time
0x40	0x108	subject_exam_places
0x43	0x10B	subject_professor_sex 1=male
*/
let subjects = [];

/* 0x478, sizes 0x1E, 5; offsets: [6][6]
0	0x478	from
2	0x47A	to
4	0x47C	where
*/
let timesheet = [];
/*
{sasha_has: true, hero_has: false} [3]
[i + 0x52E] // is_sasha_has_synopsis
[i + 0x55C] // synopsis_presences
*/
let synopsis = [];
/*
[i * 2 + 0x532] // subject_tasks_done
[i * 2 + 0x544] // subject_pass_day
[i * 2 + 0x550] // subject_knowledges
[i + 0x53E] // byte exam_passed [6]
*/
const hero = {
    subject: [],
    garlic: 0, // 25498
    has_mmheroes_disk: false, // 2549B
    has_inet: false, // 2549E
    is_invited: false, // 25496
    inception: 0, // 254A0
    is_working_in_terkom: false,
    got_stipend: false,
    has_ticket: 0,
    knows_djug: false,

    brain: 0,
    stamina: 0,
    charizma: 0,
    health: 0,
    exams_left: 6
};
/*
0x6A4, size 0x54, offsets: {str:, num:, color:} [16]
0		string
0x51	number
0x53	color
*/
const dialog = [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined,
    undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined];
/*
0x3B2, size 0x23, offsets: [5]
0		0x3B2	name
0x21	0x3D3	score
*/
const top_gamers = [];
/*
0x676, size 3, offsets: [12]
0	0x676	current_subject
2	0x678	place

0x32C, size 2
0x344, size 2
*/
let classmates = [];

let terkom_has_places = true; // 2549D
let klimov_timesheet_was_modified = 0; // 25494


/*
not known vars, seems not affects gameplay

word_2559A
word_256CE
word_256D0
asc_256D2

byte_2549F
byte_254A4
*/
// var word_2559A, word_256CE, word_256D0, asc_256D2, byte_2549F, byte_254A4;
const Algebra = 0, Matan = 1, GiT = 2, Infa = 3, English = 4, Fizra = 5;
const NoSubj = -1;

const places = [
    {title: "----"},
    {title: "ПУНК "},
    {title: "ПОМИ "},
    {title: "Компы"},
    {title: "Общага"},
    {title: "Мавзолей"}
];

const Nowhere = 0, Punk = 1, Pomi = 2, Kompy = 3, Obshaga = 4, Mavzoley = 5;
const Male = 1, Female = 0;

function _init_vars() {
    const init_subjects = function (professor_name, title, knolege_drop, health_drop, tasks, difficulty, exam_days,
        exam_min_time, exam_max_time, exam_places, professor_sex) {
        subjects.push({
            professor: {name: professor_name, sex: professor_sex},
            title: title,
            exam_days: exam_days,
            exam_min_time: exam_min_time,
            exam_max_time: exam_max_time,
            exam_places: exam_places,
            tasks: tasks,
            member0xFA: knolege_drop,
            member0xFC: health_drop,
            member0x100: difficulty
        });
    };

    subjects = [];
    init_subjects("Всемирнов М.А.", "Алгебра и Т.Ч.", 0xA, 0x11, 0xC, 3, 4, 2, 4, [Punk, Punk, Pomi], Male);
    init_subjects("Дубцов Е.С.", "Мат. Анализ", 8, 0xE, 0xA, 2, 4, 2, 3, [Punk, Punk, Punk], Male);
    init_subjects("Подкорытов С.С.", "Геометрия и Топология", 4, 8, 3, 3, 2, 1, 3, [Punk, Pomi, Pomi], Male);
    init_subjects("Климов А.А.", "Информатика", 5, 6, 2, 3, 2, 1, 2, [Kompy, Kompy, Kompy], Male);
    init_subjects("Влащенко Н.П.", "English", 7, 0xA, 3, 1, 2, 2, 2, [Punk, Punk, Punk], Female);
    init_subjects("Альбинский Е.Г.", "Физ-ра", 7, 0x14, 1, 1, 2, 1, 1, [Punk, Punk, Punk], Male);

    timesheet = [];
    for (let i = 0; i < 6; ++i) {
        timesheet.push([]);
        for (let j = 0; j < 6; ++j) {
            timesheet[i].push({from: 0, to: 0, where: 0});
        }
    }

    synopsis = [];
    for (let i = 0; i < 3; ++i) {
        synopsis.push({sasha_has: true, hero_has: false});
    }

    hero.subject = [];
    for (let i = 0; i < 6; ++i) {
        hero.subject.push({knowledge: 0, passed: false, pass_day: -1, tasks_done: 0});
    }

    /*top_gamers = [];
	for (let i = 0; i < 5; ++i) {
		top_gamers.push({name: '', score: 0});
	}*/

    classmates = [];
    for (let i = 0; i < 12; ++i) {
        classmates.push({
            current_subject: NoSubj, place: Nowhere,
            bothers_activity: [0, 0, 0, 4, 2, 0, 0, 6, 0, 0, 0, 0][i],
            bothers_penalty: [0, 0, 0, 8, 0, 0, 0, 8, 0, 0, 0, 0][i]
        });
    }
}

// [i * 0x11 + 2] // four_letters_places


// 0x74, size 7
const days = ["22.5", "23.5", "24.5", "25.5", "26.5", "27.5"];
// 0x260, size 0x11
const classmate_names = ["Коля", "Паша", "Diamond", "RAI", "Миша", "Серж", "Саша", "NiL", "Кузьменко В.Г.", "DJuG",
    "Эндрю", "Гриша"];

const Kolya = 0, Pasha = 1, Diamond = 2, Rai = 3, Misha = 4, Serzg = 5, Sasha = 6, Nil = 7, Kuzmenko = 8, Djug = 9,
    Endryu = 10, Grisha = 11;


// 0x9E, size 7
const subject_short_titles = ["АиТЧ", "МатАн", "ГиТ", "Инф", "ИнЯз", "Физ-ра"];

let dialog_case_count;
let current_color;
let is_end = false;
let is_god_mode, is_god_mode_available;

let time_of_day, day_of_week, current_place, death_cause;

let current_subject;
let last_subject;

function dialogShower(x, y) {
    const dialog = [];

    function addDialod(d) {
        dialog.push(d);
    }

    function dialog_case(str, num) {
        dialog_case_colored(str, num, 0xB);
    }

    function dialog_case_colored(str, num, color) {
        addDialod({str: str, num: num, color: color});
    }

    function dialog_show(x, y) {
        current_color = 0xB;
        for (let i = 0; i < dialog.length; ++i) {
            GotoXY(x, y + i);
            current_color = dialog[i].color;
            write(dialog[i].str);
        }
        current_color = 7;
    } // end function 20B20


    async function dialog_run() {

        let current_selection = 0;
        dialog_show(x, y);

        //console.log(dialog);
        //console.log(dialog_case_count);

        for (;;) {
            current_color = 0x70;
            GotoXY(x, y + current_selection);
            write(dialog[current_selection].str);
            const key = await ReadKey();

            current_color = dialog[current_selection].color;
            GotoXY(x, y + current_selection);
            write(dialog[current_selection].str);
            switch (key) {
            case "ArrowDown":
                current_selection = (current_selection + 1) % dialog.length;
                break;
            case "ArrowUp":
                current_selection = (current_selection + dialog.length - 1) % dialog.length;
                break;
            case "Enter":
            case " ": {
                current_color = 7;
                const result = dialog[current_selection].num;
                return result;
            }
            }
        }
    }

    return {
        dialog_run: dialog_run,
        dialog_case: dialog_case,
        dialog_case_colored: dialog_case_colored
    };
}

function dialogShower1(y) {
    return dialogShower(1, y);
}


// My little and buggy implementation of utilities like STL
function _upper_bound(cont, val) {
    for (let i = 0; i < cont.length; ++i) {
        if (cont[i] > val) {
            return i;
        }
    }
    return cont.length;
}


// My little and buggy implementation of pascal
const Screen = [];
const ScreenColor = [];
let PositionR = 0, PositionC = 0;


function idiv(x, y) {
    return Math.floor(x / y);
}

function WhereY() {
    return PositionR;
}

function WhereX() {
    return PositionC;
}

function Randomize() {
}

function ParamCount() {
    return 0;
}

function ParamStr() {
    // TODO parse url params
    return "";
}

function __CrtInit() {
    for (let i = 0; i < 25; ++i) {
        Screen.push([]);
        ScreenColor.push([]);
        for (let j = 0; j < 80; ++j) {
            Screen[i].push(" ");
            ScreenColor[i].push(0x07);
        }
    }
}

function TextColor(col) {
    current_color = current_color & 0xF0 | col;
}

function Delay(pause) { /*var start = new Date().getTime(); while (new Date().getTime - start < pause);*/
    _update_screen();
    return new Promise(resolve => setTimeout(resolve, pause));
}

function alyarme(str) {
    alert(str + "\r\n\r\n" + get_stack() + "\r\n\r\n" + JSON.stringify(Replay.data));
}

function get_stack() {
    const err = new Error();
    return err.stack;
}


let first_run = true;

const Replay = {

    data: {
        on: 0,
        rnds: [], rnds_up: [], rnds_stack: [], rnds_i: 0,
        keys: [], keys_count: 0, keys_i: 0,
        dialogs: [], dialogs_i: 0,
        strs: [], strs_i: 0,
        clrscr_count: 0, clrscr_i: 0,
        start: false, end: false,
        wait_for_dialog: false
    },

    is_on: function () {
        return this.data.on;
    },

    next_rnd: function () {
        return this.data.rnds[this.data.rnds_i++];
    },
    record_rnd: function (res, up) {
        this.data.rnds.push(res);
        this.data.rnds_up.push(up); /*this.data.rnds_stack.push(get_stack());*/
    },

    next_dialog: function () {
        return this.data.dialogs[this.data.dialogs_i++];
    },
    record_dialog: function (res) {
        this.data.keys_count -= this.data.keys.length;
        this.data.keys = [];
        this.data.dialogs.push(res);
    },
    wait_dialog: function (arg) {
        this.data.wait_for_dialog = arg;
    },

    keys_remains: function () {
        return this.data.keys_i < this.data.keys_count;
    },

    dialogs_remains: function () {
        return this.data.dialogs_i < this.data.dialogs.length;
    },

    strs_remains: function () {
        return this.data.strs_i < this.data.strs.length;
    },

    last: function () {
        return !this.keys_remains() && !this.dialogs_remains() && !this.strs_remains();
    },

    turn_off: function () {
        this.data.on = 0;
        this.data.rnds_i = 0;
        this.data.keys_i = 0;
        this.data.dialogs_i = 0;
        this.data.strs_i = 0;
        this.data.clrscr_i = 0;
        //console.log('replay now off');
    },
    turn_on: function () {
        this.data.on = 1;
        this.data.rnds_i = 0;
        this.data.keys_i = 0;
        this.data.dialogs_i = 0;
        this.data.strs_i = 0;
        this.data.clrscr_i = 0;
        //console.log('replay now ON');
    },

    restart: function () {
        //console.log('Replay.restart');
        this.data.on = 0;
        this.data.rnds = [];
        this.data.rnds_up = [];
        this.data.rnds_stack = [];
        this.data.rnds_i = 0;
        this.data.keys = [];
        this.data.keys_count = 0;
        this.data.keys_i = 0;
        this.data.dialogs = [];
        this.data.dialogs_i = 0;
        this.data.strs = [];
        this.data.strs_i = 0;
        this.data.clrscr_count = this.data.clrscr_i = 0;
        this.data.wait_for_dialog = false;
    }
};


function ClrScr() {
    PositionC = 0;
    PositionR = 0;

    for (let i = 0; i < 25; ++i) {
        for (let j = 0; j < 80; ++j) {
            Screen[i][j] = " ";
            ScreenColor[i][j] = 0x07;
        }
    }
}

function _update_screen() {
    let html = "";
    html += "<table id=\"screen\">";
    for (let i = 0; i < 25; ++i) {
        html += "<tr>";
        for (let j = 0; j < 80; ++j) {
            html += "<td class=\"fg" + (ScreenColor[i][j] & 0xF) + " bg" + (ScreenColor[i][j] >> 4) + "\">" +
                Screen[i][j] + "</td>";
        }
        html += "</tr>";
    }
    html += "</table>";

    document.getElementById("content").innerHTML = html;
}

function write(str) {
    if (str === undefined) {
        return;
    }
    if (PositionR >= 25) {
        alyarme("write at pos " + PositionR + "," + PositionC);
    }
    str = "" + str;
    for (let i = 0; i < str.length; ++i) {
        Screen[PositionR][PositionC] = str.charAt(i);
        ScreenColor[PositionR][PositionC] = current_color;
        ++PositionC;
    }
    // _update_screen();
}

function Random(up) {
    if (Replay.is_on()) {
        const rec_up = Replay.data.rnds_up[Replay.data.rnds_i];

        const res = Replay.next_rnd();
        if (rec_up !== up || up && res >= up || !up && res > 0) {
            alyarme("Replay: Random(" + up + ") = rnds[" + (Replay.data.rnds_i - 1) + "] = " + res + ", rec_up = " +
                rec_up /*+ ', rec_stack = ' + rec_stack*/);
        }
        return res;
    } else {
        const res = Math.floor(Math.random() * up);
        if (up && res >= up || !up && res > 0) {
            alyarme("Random(" + up + ") = " + res);
        }

        Replay.record_rnd(res, up);
        return res;
    }
}

function RandomPhrase(phrases) {
    const index = Random(phrases.length);
    return phrases[index];
}

function ReadKey_on() {
    return new Promise((resolve) => {
        document.onkeydown = (e) => {
            const ignoredMeta = ["Control", "Alt", "Meta", "Tab", "Shift"];
            const ignoredKeys = ["KeyC", "KeyS"];
            if (!ignoredMeta.includes(e.key)) {
                if (!ignoredKeys.includes(e.code)) {
                    resolve(e.key);
                }
            }
        };
    });
}

function ReadKey() {
    _update_screen();
    return ReadKey_on();
}

function promt_with_delay(message, default_message) {
    return new Promise(resolve => setTimeout(() => {
        const res = prompt(message, default_message);
        resolve(res);
    }, 100));
}

function readln() {
    _update_screen();
    return promt_with_delay("Enter string:", get_user_name());
}

async function dialog_run(x, y) {
    if (Replay.is_on()) {
        let result = false;
        if (Replay.dialogs_remains()) {
            result = Replay.next_dialog();
        }
        if (Replay.last()) {
            Replay.turn_off();
        }
        if (result !== false) {
            return result;
        }
    }
    Replay.wait_dialog(true);

    let current_selection = 0;
    dialog_show(x, y);


    for (;;) {
        current_color = 0x70;
        GotoXY(x, y + current_selection);
        write(dialog[current_selection].str);
        const key = await ReadKey();

        current_color = dialog[current_selection].color;
        GotoXY(x, y + current_selection);
        write(dialog[current_selection].str);
        switch (key) {
        case "ArrowDown":
            if (current_selection === dialog_case_count - 1) {
                current_selection = 0;
            } else {
                ++current_selection;
            }
            break;
        case "ArrowUp":
            if (current_selection === 0) {
                current_selection = dialog_case_count - 1;
            } else {
                --current_selection;
            }
            break;
        case "Enter":
        case " ": {
            current_color = 7;
            const result = dialog[current_selection].num;
            Replay.record_dialog(result);
            Replay.wait_dialog(false);
            return result;
        }
        }
    }
} // end function 20B87


async function Main() {
    try {
        await PROGRAM();
    } catch (e) {
        console.dir(e);
        alert(e + "\r\n" + e.stack);
    }
}


function _crlf() {
    ++PositionR;
    PositionC = 0;
}

function writeln(str) {
    if (str != undefined) {
        write(str);
    }
    _crlf();
}

function GotoXY(x, y) {
    PositionR = y - 1;
    PositionC = x - 1;
}

function Sqrt(x) {
    return Math.sqrt(x);
}

function Trunc(x) {
    return Math.floor(x);
}

function Round(x) {
    return Math.round(x);
}


function jz(a, b) {
    return a == b;
}

//function jnz(a, b) {
//    return a != b;
//}

function jl(a, b) {
    return a < b;
}

function jle(a, b) {
    return a <= b;
}

function jg(a, b) {
    return a > b;
}

function ja(a, b) {
    return a > b;
}


// from dseg
const aGamma3_14 = "gamma3.14";


async function prompt_for_new_game() {
    const aXocesPoprobova = "Хочешь попробовать еще?";
    const aDaDaDa = "ДА!!! ДА!!! ДА!!!";
    const aNet___Net___Ne = "Нет... Нет... Не-э-эт...";

    ClrScr();
    writeln(aXocesPoprobova);
    const d = dialogShower1(4);
    d.dialog_case(aDaDaDa, -1);
    d.dialog_case(aNet___Net___Ne, -2);
    const ax = await d.dialog_run();
    ClrScr();
    return ax === -1;
}


const a3decHappyBirth = "-3dec-happy-birthday-Diamond";


async function PROGRAM() {
    _init_vars();

    __CrtInit();

    dialog_case_count = 0;
    Randomize();

    if (ParamCount() > 0 && ParamStr(1) == a3decHappyBirth) {
        is_god_mode_available = 1;
    }

    do {
        if (!Replay.is_on()) {
            read_top_gamers();
            Replay.restart();
        }

        //_init_vars();
        if (first_run) {
            await show_intro_screen();
            first_run = false;
        }

        await init_game();
        await show_dzin_and_timesheet();

        do {
            await scene_router();
            await check_exams_left_count();
        } while (!is_end);

        await game_end();
    } while (await prompt_for_new_game());
    await show_disclaimer();
    write_top_gamers();
}


async function show_dzin_and_timesheet() {
    const aDzin = "ДЗИНЬ!";
    const aDddzzzzziiiiii = "ДДДЗЗЗЗЗИИИИИИННННННЬ !!!!";
    const aDdddddzzzzzzzz = "ДДДДДДЗЗЗЗЗЗЗЗЗЗЗЗЗИИИИИИИИИИННННННННННННЬ !!!!!!!!!!";
    const aTiProsipaesSqO = "Ты просыпаешься от звонка будильника ";
    const aGoMaqV800_ = "-го мая в 8:00. ";
    const aNeojidannoTiOs = "Неожиданно ты осознаешь, что началась зачетная неделя,";
    const aATvoqGotovnost = "а твоя готовность к этому моменту практически равна нулю.";
    const aNatqgivaqNaSeb = "Натягивая на себя скромное одеяние студента,";
    const aTiVsmatrivaesS = "ты всматриваешься в заботливо оставленное соседом на стене";
    const aRaspisanieKogd = "расписание: когда и где можно найти искомого препода ?";


    ClrScr();
    TextColor(0x0A);
    writeln(aDzin);
    await Delay(0x1F4);
    TextColor(0x0E);
    writeln(aDddzzzzziiiiii);
    await Delay(0x2BC);
    TextColor(0x0C);
    writeln(aDdddddzzzzzzzz);
    await Delay(0x3E8);
    TextColor(7);
    write(aTiProsipaesSqO);
    write(0x16);
    writeln(aGoMaqV800_);
    writeln(aNeojidannoTiOs);
    writeln(aATvoqGotovnost);
    writeln(aNatqgivaqNaSeb);
    writeln(aTiVsmatrivaesS);
    writeln(aRaspisanieKogd);
    await wait_for_key();
    ClrScr();
    show_timesheet();
    await wait_for_key();
    ClrScr();
} // end function 102EF


const aNowhere_at_tur = "nowhere_at_turn";


async function scene_router() {
    if (current_place === Pomi) {
        if (current_subject === NoSubj) {
            await scene_pomi();
        } else {
            await scene_exam();
        }
    } else if (current_place === Punk) {
        if (current_subject === NoSubj) {
            await scene_punk();
        } else {
            await scene_exam();
        }
    } else if (current_place === Mavzoley) {
        await scene_mausoleum();
    } else if (current_place === Obshaga) {
        await scene_obschaga();
    } else if (current_place === Kompy) {
        if (current_subject === NoSubj) {
            await scene_kompy();
        } else {
            await scene_exam();
        }
    } else if (current_place === Nowhere) {
        await bug_report(aNowhere_at_tur);
    }
} // end function 10433


async function game_end_death() {
    const aLegceLbomKolot = "Легче лбом колоть орехи,";
    const aCemUcitSqNaMat = "чем учиться на МАТ-МЕХе.";

    send_replay({death_cause: death_cause});
    current_color = 0x0C;
    writeln(aLegceLbomKolot);
    writeln(aCemUcitSqNaMat);
    current_color = 0x0D;
    writeln(death_cause);
    await wait_for_key();
} // end function 104DC


const aUfffffVoVsqkom = "Уффффф! Во всяком случае, ты еще живой.";
const aYesTiSdelalAto = "********* Yes! Ты сделал это! *********";
const aUTebqNetCelix = "У тебя нет целых ";
const aZacetov = " зачетов!";
const aTiOtcislen = "ТЫ ОТЧИСЛЕН!";
const aNetDvuxZacetov = "Нет двух зачетов - плохо.";
const aGovorqtUMexani = "Говорят, у механиков жизнь проще...";
const aZrqGovorqtXalq = "- Зря говорят, ХАЛЯВЫ НЕ БУДЕТ!";
const aNetOdnogoZacet = "Нет одного зачета.";
const aNicegoOtAtogoE = "Ничего, от этого еще никто не помирал.";
const aPozdravlquTiMo = "Поздравляю: ты можешь считать себя настоящим героем Мат-Меха!";
const aUspesnoiTebeSe = "Успешной тебе сессии !";
const aUTebqNetZaceta = "У тебя нет зачета по алгебре!";
const aVsemirnovDokan = "Всемирнов доканал тебя на сессии.";
const aEstestvennoAto = "Естественно, это повлияло на твои оценки.";
const aUTebqNetDopusk = "У тебя нет допуска по матану!";
const aUTebqNetZace_0 = "У тебя нет зачета по геометрии!";
const aKakTebqUgorazd = "Как тебя угораздило?";
const aKSessiiTiGotov = "К сессии ты \"готовился\", \"работая\" в ТЕРКОМе.";
const aTiResilBolSeNi = "Ты решил больше никогда так не делать.";
const aTvoqStipuxa = "Твоя стипуха - ";
const aRub_ = " руб.";
const aVZanacke = "В заначке ";
const aDaTiEseIGodNet = "Да ты еще и GOD! Нет, тебе в таблицу рекордов нельзя.";
const aTebqOstaviliBe = "Тебя оставили без стипухи.";


async function game_end_alive() {
    if (hero.exams_left > 0) {
        colored_output(0x0D, aUfffffVoVsqkom);
    } else {
        colored_output(0x0F, aYesTiSdelalAto);
    }

    writeln();
    writeln();

    if (hero.exams_left >= 3) {
        colored_output(0x0C, aUTebqNetCelix);
        colored_output_white(hero.exams_left);
        colored_output(0x0C, aZacetov);
        writeln();
        colored_output(0x0D, aTiOtcislen);

        send_replay();

        await wait_for_key();
        return;
    } else if (hero.exams_left === 2) {
        colored_output_ln(0x0E, aNetDvuxZacetov);
        colored_output_ln(0x0E, aGovorqtUMexani);
        colored_output_ln(0x0E, aZrqGovorqtXalq);
    } else if (hero.exams_left === 1) {
        colored_output_ln(0x0A, aNetOdnogoZacet);
        colored_output_ln(0x0A, aNicegoOtAtogoE);
    } else if (hero.exams_left === 0) {
        colored_output_ln(0x0F, aPozdravlquTiMo);
        colored_output_ln(0x0F, aUspesnoiTebeSe);
    }

    let score = 0;
    for (let subj = 0; subj <= 5; ++subj) {
        if (hero.subject[subj].pass_day !== -1) {
            score +=
                idiv((6 - hero.subject[subj].pass_day) *
                    (subjects[subj].tasks + subjects[subj].member0xFA) * 2, 3);
        }
    }


    if (!hero.subject[Algebra].passed) {
        current_color = 0x0C;
        writeln();
        writeln(aUTebqNetZaceta);
        writeln(aVsemirnovDokan);
        writeln(aEstestvennoAto);
        current_color = 7;

        score -= (subjects[Algebra].tasks - hero.subject[Algebra].tasks_done) * 4;
        if (score < 0) {
            score = 0;
        }
    }

    if (!hero.subject[Matan].passed) {
        current_color = 0x0C;
        writeln();
        writeln(aUTebqNetDopusk);
        score = idiv(score * 2, 3);
        current_color = 7;
    }

    if (!hero.subject[GiT].passed) {
        current_color = 0x0C;
        writeln();
        writeln(aUTebqNetZace_0);
        writeln(aKakTebqUgorazd);
        score = idiv(score * 2, 3);
        current_color = 7;
    }

    if (hero.is_working_in_terkom) {
        current_color = 0x0C;
        writeln();
        writeln(aKSessiiTiGotov);
        writeln(aTiResilBolSeNi);
        score = idiv(score * 2, 3);
        current_color = 7;
    }

    writeln();

    if (score <= 0) {
        writeln(aTebqOstaviliBe);
    } else {
        write(aTvoqStipuxa);
        colored_output_white(score);
        writeln(aRub_);
        write(aVZanacke);
        TextColor(0x0F);
        write(hero.money);
        TextColor(7);
        writeln(aRub_);
        writeln();

        if (is_god_mode) {
            score = 0;
            hero.money = 0;
            writeln(aDaTiEseIGodNet);
        } else {
            await update_top_gamers(score + hero.money);
        }
    }
    await wait_for_key();
} // end function 1081D


async function show_intro_screen() {
    const aNamPonqtenAtot = "                                                Нам понятен этот смех";
    const aNePopavsixNaM = "                                                Не попавших на Мат-Мех";
    const aNadpisNaParte = "                                                  (надпись на парте)";
    const aHHEeeRrOEeeSsM = " H H  EEE  RR    O   EEE  SS       M   M  A   A TTTTT       M   M  EEE  X   X";
    const aHHERROOESMmMmA = " H H  E    R R  O O  E   S         MM MM  AAAAA   T         MM MM    E   X X";
    const aHhhEeRrOOEeSOf = " HHH  EE   RR   O O  EE   S    OF  M M M  A   A   T    &&&  M M M   EE    X";
    const aHHERROOESMMAAT = " H H  E    R R  O O  E     S       M   M   A A    T         M   M    E   X X";
    const aHHEeeRROEeeSsM = " H H  EEE  R R   O   EEE SS        M   M    A     T         M   E  EEE  X   X";
    const aGeroiMataIMexa = "                             ГЕРОИ МАТА И МЕХА ;)";
    const aPCrwmmDevelopm = "(P) CrWMM Development Team, 2001.";
    const aVersiq = "Версия ";
    const aZaglqniteNaNas = "Загляните на нашу страничку: mmheroes.chat.ru !";

    ClrScr();
    TextColor(8);
    writeln(aNamPonqtenAtot);
    writeln(aNePopavsixNaM);
    writeln(aNadpisNaParte);
    writeln();
    writeln();
    writeln();
    TextColor(0x0F);
    writeln(aHHEeeRrOEeeSsM);
    writeln(aHHERROOESMmMmA);
    writeln(aHhhEeRrOOEeSOf);
    writeln(aHHERROOESMMAAT);
    writeln(aHHEeeRROEeeSsM);
    writeln();
    writeln();
    TextColor(0x0C);
    writeln(aGeroiMataIMexa);
    writeln();
    writeln();
    TextColor(0x0B);
    writeln(aPCrwmmDevelopm);
    write(aVersiq);
    write(aGamma3_14);
    writeln(".");
    writeln(aZaglqniteNaNas);
    await wait_for_key();
    ClrScr();
} // end function 10E96


async function game_end() {
    ClrScr();
    if (hero.health <= 0) {
        await game_end_death();
    } else {
        await game_end_alive();
    }
} // end function 11029


async function show_disclaimer() {
    const aDisclaimer = "DISCLAIMER";
    const a1_VsePersonaji = "1.) Все персонажи реальны. Эта программа является лишь неким отражением";
    const aMneniqEeAvtora = "    мнения ее автора об окружающей действительности.";
    const aAvtorNeStavilC = "    Автор не ставил цели оценить чью-либо линию поведения.";
    const a2_PoctiVseSobi = "2.) Почти все события реальны. Естественно, многие из них";
    const aPredstavleniVN = "    представлены в несколько аллегорическом виде.";
    const a3_VseSovpadeni = "3.) Все совпадения с другими реальными зачетными неделями,";
    const aProvedennimiKe = "    проведенными кем-либо в каком-либо ВУЗе, лишь подчеркивают";
    const aRealisticnostV = "    реалистичность взглядов автора на реальность.";
    const a_EsliViNasliVD = "*.) Если вы нашли в данной программе ошибку (любую, включая опечатки),";
    const aVasiKommentari = "    Ваши комментарии будут очень полезны.";
    const aAvtorNeNesetOt = "Автор не несет ответственность за психическое состояние игрока.";


    ClrScr();
    TextColor(0x0A);
    writeln(aDisclaimer);
    writeln();
    TextColor(9);
    writeln(a1_VsePersonaji);
    writeln(aMneniqEeAvtora);
    writeln(aAvtorNeStavilC);
    writeln();
    writeln(a2_PoctiVseSobi);
    writeln(aPredstavleniVN);
    writeln();
    writeln(a3_VseSovpadeni);
    writeln(aProvedennimiKe);
    writeln(aRealisticnostV);
    writeln();
    writeln();
    TextColor(0x0C);
    writeln(a_EsliViNasliVD);
    writeln(aVasiKommentari);
    writeln();
    TextColor(8);
    writeln(aAvtorNeNesetOt);
    await wait_for_key();
    ClrScr();
    _update_screen();
} // end function 112D0


function goto_kompy_to_obschaga() {
    current_subject = -1;
    current_place = Obshaga;
} // end function 11450


function goto_kompy_to_punk() {
    const aNeSmogRasstatS = "Не смог расстаться с компьютером.";

    current_place = 1;
    current_subject = -1;
    decrease_health(2, aNeSmogRasstatS);
} // end function 11482


const aZdraviiSmislPo = "Здравый смысл подсказывает тебе, что в такое время";
const aTiTamNikogoUje = "ты там никого уже не найдешь.";
const aNeBudemZrqTrat = "Не будем зря тратить здоровье на поездку в ПОМИ.";
const aVAlektrickeNas = "В электричке нашли бездыханное тело.";
const aDenegUTebqNetP = "Денег у тебя нет, пришлось ехать зайцем...";
const aTebqZaloviliKo = "Тебя заловили контролеры!";
const aVisadiliVKrasn = "Высадили в Красных зорях, гады!";
const aKontroleriJizn = "Контролеры жизни лишили.";
const aUfDoexal = "Уф, доехал!";
const aExatZaicem = "Ехать зайцем";
const aCestnoZaplatit = "Честно заплатить 10 руб. за билет в оба конца";


async function goto_kompy_to_pomi() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    if (time_of_day > 20) {
        writeln(aZdraviiSmislPo);
        writeln(aTiTamNikogoUje);
        writeln(aNeBudemZrqTrat);
        await wait_for_key();
        return;
    }

    decrease_health(Random(0x0A), aVAlektrickeNas);
    current_place = Pomi;

    if (hero.money < 10) {
        writeln(aDenegUTebqNetP);

        if (hero.charizma < Random(0x0A)) {
            writeln(aTebqZaloviliKo);
            writeln(aVisadiliVKrasn);
            decrease_health(0xA, aKontroleriJizn);
            await hour_pass();
        } else {
            writeln(aUfDoexal);
        }

    } else {

        dialog_start();
        dialog_case(aExatZaicem, -1);
        dialog_case(aCestnoZaplatit, -2);
        const result = await dialog_run(1, 0x0C);
        if (result === -1) {
            if (hero.charizma < Random(0x0A)) {
                GotoXY(1, 0x0F);
                writeln(aTebqZaloviliKo);
                writeln(aVisadiliVKrasn);
                await hour_pass();
            } else {
                GotoXY(1, 0x0F);
                writeln(aUfDoexal);
            }
        } else if (result === -2) {
            hero.money -= 10;
            hero.has_ticket = 1;
        }
    }

    await wait_for_key();
    await hour_pass();
} // end function 1160A


async function goto_klimov() {
    const aKlimovA_a_Sidi = "Климов А.А. сидит и тоскует по халявному Inet'у.";
    const a___ = "...";
    if (Random(2) === 0) {
        ClrScr();
        TextColor(7);
        writeln(aKlimovA_a_Sidi);
        writeln(a___);
        await ReadKey();
        ClrScr();
    }
    current_subject = Kompy;
} // end function 1182D


function goto_kompy_to_mausoleum() {
    const aUmerPoPutiVMav = "Умер по пути в мавзолей.";
    current_subject = -1;
    current_place = Mavzoley;
    decrease_health(2, aUmerPoPutiVMav);
} // end function 1189E


const aDzin_0 = "ДЗИНЬ!";
const aDddzzzzziiii_0 = "ДДДЗЗЗЗЗИИИИИИННННННЬ !!!!";
const aDdddddzzzzzz_0 = "ДДДДДДЗЗЗЗЗЗЗЗЗЗЗЗЗИИИИИИИИИИННННННННННННЬ !!!!!!!!!!";
const aNeojidannoTi_0 = "Неожиданно ты осознаешь, что началась зачетная неделя,";
const aATvoqGotovno_0 = "а твоя готовность к этому моменту практически равна нулю.";
const aNatqgivaqNaS_0 = "Натягивая на себя скромное одеяние студента,";
const aTiVsmatrivae_0 = "ты всматриваешься в заботливо оставленное соседом на стене";
const aRaspisanieKo_0 = "расписание: когда и где можно найти искомого препода ?";
const aStop = "!!!!!! СТОП! !!!!!!";
const aCtoToTakoeTiUj = "ЧТО-ТО ТАКОЕ ТЫ УЖЕ ВИДЕЛ!!!";
const aOglqdevsisVokr = "Оглядевшись вокруг, ты осознаешь, что, вроде бы,";
const aAkstraordinarn = "экстраординарного не произошло. Ты просто играешь в компьютерную";
const aIgruNeSamogoLu = "игру не самого лучшего качества, в которой тебе вдруг предложили...";
const aSigratVAtuSamu = "СЫГРАТЬ В ЭТУ САМУЮ ИГРУ! [...]";
const aRazdvoenieLojn = "Раздвоение ложной личности.";
const aNeKajdiiSposob = "Не каждый способен пережить такое потрясение.";
const aPostepennoKTeb = "Постепенно к тебе приходит осознание того, что";
const aNaSamomDeleVse = "на самом деле, все это - компьютерная игра, и, следовательно,";
const aAtiSobitiqProi = "эти события происходят только в твоем воображении.";
const aVovremqViidqIz = "Вовремя выйдя из странного трансцендентального состояния,";
const aTiObnarujivaes = "ты обнаруживаешь себя в компьютерном классе Мат-Меха.";
const aPravdaMirVokru = "Правда, мир вокруг тебя, похоже, несколько иной,";
const aNejeliOnBilCas = "нежели он был час минут назад...";


async function play_mmheroes() {
    ++hero.inception;
    ClrScr();
    TextColor(0x0A);
    writeln(aDzin_0);
    await Delay(0x1F4);
    TextColor(0x0E);
    writeln(aDddzzzzziiii_0);
    await Delay(0x2BC);
    TextColor(0x0C);
    writeln(aDdddddzzzzzz_0);
    await Delay(0x3E8);
    TextColor(7);
    writeln(aNeojidannoTi_0);
    writeln(aATvoqGotovno_0);
    writeln(aNatqgivaqNaS_0);
    writeln(aTiVsmatrivae_0);
    writeln(aRaspisanieKo_0);
    await wait_for_key();
    ClrScr();
    TextColor(0x0F);
    writeln(aStop);
    writeln();
    writeln(aCtoToTakoeTiUj);
    writeln(aOglqdevsisVokr);
    writeln(aAkstraordinarn);
    writeln(aIgruNeSamogoLu);
    writeln(aSigratVAtuSamu);
    await ReadKey();

    if (hero.stamina + hero.brain - hero.inception * 5 < 8) {
        decrease_health(0x64, aRazdvoenieLojn);
    }

    await hour_pass();

    if (hero.health <= 0) {
        return;
    }

    writeln();
    TextColor(0x0E);
    writeln(aNeKajdiiSposob);
    writeln(aPostepennoKTeb);
    writeln(aNaSamomDeleVse);
    writeln(aAtiSobitiqProi);
    writeln(aVovremqViidqIz);
    writeln(aTiObnarujivaes);
    writeln(aPravdaMirVokru);
    writeln(aNejeliOnBilCas);
    inception_reinit_timesheet();
    await wait_for_key();
} // end function 11CD5


const aUxTiTiNaselPro = "Ух ты! Ты нашел програмку, которая нужна для Климова!";


async function surf_inet() {
    if (is_god_mode || Random(hero.brain) > 6 && hero.subject[Infa].tasks_done < hero.subject[Infa].tasks) {
        GotoXY(1, 0x14);
        TextColor(0x0B);
        writeln(aUxTiTiNaselPro);
        ++hero.subject[Infa].tasks_done;
    } else if (Random(3) === 0 && hero.brain < 5) {
        ++hero.brain;
    }
    await wait_for_key();
    await hour_pass();
} // end function 11FA2


const aKlassZakrivaet = "Класс закрывается. Пошли домой!";
const aUmerPoPutiDomo = "Умер по пути домой. Бывает.";
const aTiVKompUternom = "Ты в компьютерном классе. Что делать?";
const aKlimovA_a_ = "Климов А.А.";
const aPoitiVObsagu = "Пойти в общагу";
const aPokinutKlass = "Покинуть класс";
const aPoexatVPomi = "Поехать в ПОМИ";
const aPoitiVMavzolei = "Пойти в мавзолей";
const aProvesti1CasVI = "Провести 1 час в Inet'е";
const aPoigratVMmhero = "Поиграть в MMHEROES";
const aSMenqXvatit = "С меня хватит!";


async function scene_kompy() {
    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);

    if (time_of_day > 20) {
        writeln(aKlassZakrivaet);
        await wait_for_key();
        current_subject = -1;
        current_place = 4;
        decrease_health(Random(5), aUmerPoPutiDomo);
        return;
    }

    writeln(aTiVKompUternom);

    dialog_start();
    if (is_professor_here(Infa)) {
        dialog_case_colored(aKlimovA_a_, -1, 0x0E);
    }
    dialog_case(aPoitiVObsagu, -2);
    dialog_case(aPokinutKlass, -3);
    dialog_case(aPoexatVPomi, -4);
    dialog_case(aPoitiVMavzolei, -5);
    if (hero.has_inet) {
        dialog_case(aProvesti1CasVI, -11);
    }
    for (let i = 0; i <= 0xB; ++i) {
        if (classmates[i].place === Kompy) {
            dialog_case_colored(classmate_names[i], i, 0xE);
        }
    }
    if (hero.has_mmheroes_disk) {
        dialog_case(aPoigratVMmhero, -10);
    }
    dialog_case_colored(aSMenqXvatit, -6, 9);

    show_short_today_timesheet(0x0A);

    const res = await dialog_run(1, 0x0A);
    const arr = {
        1: goto_klimov,
        2: goto_kompy_to_obschaga,
        3: goto_kompy_to_punk,
        4: goto_kompy_to_pomi,
        5: goto_kompy_to_mausoleum,
        6: request_exit,
        10: play_mmheroes,
        11: surf_inet
    };
    if (arr[-res] !== undefined) {
        await arr[-res]();
    } else if (res >= 0 && res <= 0xB) {
        await talk_with_classmate(res);
    }
} // end function 120F8


function goto_mausoleum_to_punk() {
    const aUmerPoPutiNaFa = "Умер по пути на факультет.";
    decrease_health(3, aUmerPoPutiNaFa);
    current_subject = -1;
    current_place = 1;
}


function goto_mausoleum_to_obschaga() {
    current_subject = -1;
    current_place = Obshaga;
} // end function 12307


const aViberiSebeSpos = "Выбери себе способ \"культурного отдыха\".";
const aStakanKoliZa4R = "Стакан колы за 4 р.";
const aSup6R_VseUdovo = "Суп, 6 р. все удовольствие";
const a05PivaZa8R_ = "0,5 пива за 8 р.";
const aRasslablqtSqBu = "Расслабляться будем своими силами.";
const aNetOtdixatAtoQ = "Нет, отдыхать - это я зря сказал.";
const aPivnoiAlkogoli = "Пивной алкоголизм, батенька...";


async function rest_in_mausoleum() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    writeln(aViberiSebeSpos);
    show_short_today_timesheet(0x0B);

    dialog_start();
    if (hero.money >= 4) {
        dialog_case(aStakanKoliZa4R, -2);
    }
    if (hero.money >= 6) {
        dialog_case(aSup6R_VseUdovo, -3);
    }
    if (hero.money >= 8) {
        dialog_case(a05PivaZa8R_, -1);
    }
    dialog_case(aRasslablqtSqBu, -4);
    dialog_case(aNetOtdixatAtoQ, 0);
    const res = await dialog_run(1, 0x0B);

    if (res === -1) {
        hero.money -= 8;
        if (Random(3) === 0) {
            --hero.brain;
        }
        if (Random(3) === 0) {
            ++hero.charizma;
        }
        if (Random(2) === 0) {
            ++hero.stamina;
        }
        hero.health += Random(hero.charizma);
        check_brain_dead(aPivnoiAlkogoli);
    } else if (res === -2) {
        hero.money -= 4;
        hero.health += Random(hero.charizma) + 3;
    } else if (res === -3) {
        hero.money -= 6;
        hero.health += Random(hero.charizma) + 5;
    } else if (res === -4) {
        hero.health += Random(hero.charizma);
    } else if (res === 0) {
        return;
    }

    await hour_pass();
} // end function 123E4


const aTiVMavzolee_Ct = "Ты в мавзолее. Что делать?";
const aIdtiVPunk = "Идти в ПУНК";
const aPoexatVPomi_0 = "Поехать в ПОМИ";
const aIdtiVObsagu = "Идти в общагу";
const aOtdixat = "Отдыхать";
const aSMenqXvatit_0 = "С меня хватит!";


async function scene_mausoleum() {
    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);
    writeln(aTiVMavzolee_Ct);

    dialog_start();
    dialog_case(aIdtiVPunk, -1);
    dialog_case(aPoexatVPomi_0, -5);
    dialog_case(aIdtiVObsagu, -2);
    dialog_case(aOtdixat, -3);
    for (let i = 0; i <= 0xB; ++i) {
        if (classmates[i].place === Mavzoley) {
            dialog_case_colored(classmate_names[i], i, 0xE);
        }
    }
    dialog_case_colored(aSMenqXvatit_0, -4, 9);

    show_short_today_timesheet(0x0A);

    const res = await dialog_run(1, 0x0A);
    if (res === -1) {
        await goto_mausoleum_to_punk();
    } else if (res === -2) {
        await goto_mausoleum_to_obschaga();
    } else if (res === -3) {
        await rest_in_mausoleum();
    } else if (res === -4) {
        await request_exit();
    } else if (res === -5) {
        await goto_punk_or_mausoleum_to_pomi();
    } else if (res >= 0 && res <= 0xB) {
        await talk_with_classmate(res);
    }

} // end function 12595


const aKCemuGotovitSq = "К чему готовиться?";
const aK = " (к)";
const aNiKCemu = "Ни к чему";
const aVospolZuusKons = "Воспользуюсь конспектом";
const aBuduUcitSqKakU = "Буду учиться, как умею";
const aZaucilsq_ = "Заучился.";
const aZubrejkaDoDobr = "Зубрежка до добра не доводит!";


async function botva() {
    ClrScr();
    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);
    writeln(aKCemuGotovitSq);

    dialog_start();
    for (let i = 0; i <= 5; ++i) {
        dialog_case(subjects[i].title + (i <= 2 && synopsis[i].hero_has ? aK : ""), i);
    }
    dialog_case(aNiKCemu, -1);

    show_short_today_timesheet(0x0A);

    const subj = await dialog_run(1, 0x0A);
    if (subj === -1) {
        return;
    }

    let use_synopsis = false;
    if (subj <= 2 && synopsis[subj].hero_has) {
        dialog_start();
        dialog_case(aVospolZuusKons, -1);
        dialog_case(aBuduUcitSqKakU, -2);
        const ax = await dialog_run(1, 0x12);
        use_synopsis = ax === -1;
    }

    const knowledge_add = subj === Fizra ? hero.stamina : hero.brain;
    if (knowledge_add <= 0) {
        return;
    }

    hero.subject[subj].knowledge +=
        (time_of_day < 19 ? knowledge_add : idiv(knowledge_add * 2, 3)) -
        Random(idiv(knowledge_add, 2)) +
        Random(idiv(hero.health, 0x12)) +
        (use_synopsis ? 0xA : 0);

    // #warning
    if (hero.subject[subj].knowledge < 0) {
        alert(hero.subject[subj].knowledge);
    }

    let health_penalty;
    if (hero.stamina > 0) {
        health_penalty = 0xA - Random(hero.stamina);
    } else {
        health_penalty = Random(hero.stamina) + 0xA;
    }
    if (health_penalty < 0 || use_synopsis) {
        health_penalty = 0;
    }
    if (time_of_day > 21 || time_of_day < 4) {
        health_penalty += 12;
    }
    decrease_health(health_penalty, aZaucilsq_);

    if (hero.subject[subj].knowledge > 45) {
        decrease_health(0x0A, aZubrejkaDoDobr);
    }

    if (!is_end) {
        await hour_pass();
    }
} // end function 12719


const aUmerPoPutiNa_0 = "Умер по пути на факультет.";


function goto_obschaga_to_punk() {
    current_place = Punk;
    current_subject = -1;
    decrease_health(3, aUmerPoPutiNa_0);
} // end function 12995


const aZdraviiSmisl_0 = "Здравый смысл подсказывает тебе, что в такое время";
const aTiTamNikogoU_0 = "ты там никого уже не найдешь.";
const aNeBudemZrqTr_0 = "Не будем зря тратить здоровье на поездку в ПОМИ.";
const aVAlektrickeN_0 = "В электричке нашли бездыханное тело.";
const aDenegUTebqNe_0 = "Денег у тебя нет, пришлось ехать зайцем...";
const aTebqZalovili_0 = "Тебя заловили контролеры!";
const aVisadiliVKra_0 = "Высадили в Красных зорях, гады!";
const aKontroleriJi_0 = "Контролеры жизни лишили.";
const aUfDoexal_0 = "Уф, доехал!";
const aExatZaicem_0 = "Ехать зайцем";
const aCestnoZaplat_0 = "Честно заплатить 10 руб. за билет в оба конца";


async function goto_obschaga_to_pomi() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);

    if (time_of_day > 20) {
        ClrScr();
        writeln(aZdraviiSmisl_0);
        writeln(aTiTamNikogoU_0);
        writeln(aNeBudemZrqTr_0);
        await wait_for_key();
        return;
    }

    decrease_health(Random(0x0A), aVAlektrickeN_0);
    current_place = Pomi;

    if (hero.money < 10) {

        writeln(aDenegUTebqNe_0);
        if (hero.charizma < Random(0x0A)) {
            writeln(aTebqZalovili_0);
            writeln(aVisadiliVKra_0);
            decrease_health(0x0A, aKontroleriJi_0);
            await hour_pass();
        } else {
            writeln(aUfDoexal_0);
        }

    } else {

        dialog_start();
        dialog_case(aExatZaicem_0, -1);
        dialog_case(aCestnoZaplat_0, -2);
        const res = await dialog_run(1, 0x0C);

        if (jz(res, -1)) {
            if (hero.charizma < Random(0x0A)) {
                GotoXY(1, 0x0F);
                writeln(aTebqZalovili_0);
                writeln(aVisadiliVKra_0);
                decrease_health(0x0A, aKontroleriJi_0);
                await hour_pass();
            } else {
                GotoXY(1, 0x0F);
                writeln(aUfDoexal_0);
            }
        } else if (jz(res, -2)) {
            hero.money -= 10;
            hero.has_ticket = 1;
        }

    }

    await wait_for_key();
    await hour_pass();
} // end function 12B1E


const aUmerPoPutiVM_0 = "Умер по пути в мавзолей.";


function goto_obschaga_to_mausoleum() {
    current_subject = -1;
    current_place = Mavzoley;
    decrease_health(3, aUmerPoPutiVM_0);
} // end function 12D2A


async function see_timesheet() {
    ClrScr();
    show_timesheet();
    await wait_for_key();
    ClrScr();
} // end function 12D46


const aTebqCegoToNeTq = "Тебя чего-то не тянет по-спать...";


async function try_sleep() {
    if (time_of_day > 3 && time_of_day < 20) {
        GotoXY(1, 0x16);
        writeln(aTebqCegoToNeTq);
        await wait_for_key();
    } else {
        await goto_sleep();
    }
} // end function 12D81


function clamp0(arg_2) {
    return arg_2 < 0 ? 0 : arg_2;
} // end function 12DC1


const aKTebeLomitsqSo = "К тебе ломится сосед и приглашает тебя ";
const aNaSvoiDenRojde = "на свой День Рожденья.";
const aNaDiskotekuVSa = "на дискотеку в \"Шайбе\".";
const aPoigratVMafiu_ = "поиграть в мафию.";
const aPoQuakat_ = "по-Quakать.";
const aUguQSeicas = "\"Угу, я сейчас!!!\"";
const aNeIzviniMneGot = "\"Не, извини, мне готовиться надо...\"";
const aPosliOttqgivat = "\"Пошли оттягиваться!\"";
const aNuIZrq = "\"Ну и зря!\"";


async function invite_from_neighbor() {
    write(aKTebeLomitsqSo);
    const phrases = [aNaSvoiDenRojde, aNaDiskotekuVSa, aPoigratVMafiu_, aPoQuakat_];
    writeln(RandomPhrase(phrases));

    dialog_start();
    dialog_case(aUguQSeicas, -1);
    dialog_case(aNeIzviniMneGot, -2);
    const res = await dialog_run(1, 0x0A);

    if (res === -1) {

        GotoXY(1, 0x0E);
        writeln(aPosliOttqgivat);

        for (let var_2 = 2, var_6 = Random(3) + 4; var_2 <= var_6; ++var_2) {
            await hour_pass();
            const subj = random_from_to(0, 5);
            hero.subject[subj].knowledge -=
                Random(Math.round(Math.sqrt(hero.subject[subj].knowledge * 2.0)));

            // #warning
            if (hero.subject[subj].knowledge < 0) {
                alert(hero.subject[subj].knowledge);
            }

            if (hero.charizma > Random(0x19)) {
                hero.health += Random(5) + 1;
            }
        }

        ++hero.charizma;

        if (hero.brain < 2) {
            hero.brain = Random(3) + 2;
        }

    } else if (res === -2) {
        GotoXY(1, 0x0E);
        writeln(aNuIZrq);
        hero.charizma -= Random(2) + 1;
    }

    await wait_for_key();
    ClrScr();
} // end function 12EB2


const aTebqNeumolimoK = "Тебя неумолимо клонит ко сну ...";
const aTiVObsage_CtoD = "Ты в общаге. Что делать?";
const aGotovitSq = "Готовиться";
const aPosmotretRaspi = "Посмотреть расписание";
const aOtdixat_0 = "Отдыхать";
const aLecSpat = "Лечь спать";
const aPoitiNaFakulTe = "Пойти на факультет";
const aPoexatVPomi_1 = "Поехать в ПОМИ";
const aPoitiVMavzol_0 = "Пойти в мавзолей";
const aSMenqXvatit_1 = "С меня хватит!";
const aCtoDelat = "ЧТО ДЕЛАТЬ ???";


async function scene_obschaga() {
    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);

    if (23 - idiv(clamp0(50 - hero.health), 0xC) < time_of_day || time_of_day < 4) {
        writeln(aTebqNeumolimoK);
        await wait_for_key();
        await goto_sleep();
        return;
    } else if (time_of_day > 17 && Random(0x0A) < 3 && !hero.is_invited) {
        hero.is_invited = true;
        await invite_from_neighbor();
        return;
    }

    writeln(aTiVObsage_CtoD);
    dialog_start();
    dialog_case(aGotovitSq, -1);
    dialog_case(aPosmotretRaspi, -2);
    dialog_case(aOtdixat_0, -3);
    dialog_case(aLecSpat, -4);
    dialog_case(aPoitiNaFakulTe, -5);
    dialog_case(aPoexatVPomi_1, -6);
    dialog_case(aPoitiVMavzol_0, -7);
    dialog_case_colored(aSMenqXvatit_1, -8, 9);
    dialog_case_colored(aCtoDelat, -9, 9);
    show_short_today_timesheet(0x0A);

    const res = await dialog_run(1, 0x0A);
    if (res === -1) {
        await botva();
    } else if (res === -2) {
        await see_timesheet();
    } else if (res === -3) {
        await rest_in_obschaga();
    } else if (res === -4) {
        await try_sleep();
    } else if (res === -5) {
        await goto_obschaga_to_punk();
    } else if (res === -6) {
        await goto_obschaga_to_pomi();
    } else if (res === -7) {
        goto_obschaga_to_mausoleum();
    } else if (res === -8) {
        await request_exit();
    } else if (res === -9) {
        await request_help(1);
    }
} // end function 1312F


function show_char_description(character, description) {
    TextColor(0x0E);
    write(character);
    TextColor(7);
    writeln(description);
} // end function 132D0


function output_colored_string(s) {
    for (let i = 0; i < s.length; ++i) {
        const c = s.charCodeAt(i);
        if (c >= 0 && c <= 0x0F) {
            TextColor(c);
        } else {
            write(s.substr(i, 1));
        }
    }
    writeln();
} // end function 13339


const aACtoVoobseDela = " А что вообще делать? ";
const aObAkrane = " Об экране            ";
const aKudaIZacemXodi = " Куда и зачем ходить? ";
const aOPrepodavatelq = " О преподавателях     ";
const aOPersonajax = " О персонажах         ";
const aObAtoiProgramm = " Об этой программе    ";
const aSpasiboNicego = " Спасибо, ничего      ";
const aCtoTebqInteres = "Что тебя интересует?";


async function select_help_page() {
    dialog_start();
    dialog_case(aACtoVoobseDela, -1);
    dialog_case(aObAkrane, -10);
    dialog_case(aKudaIZacemXodi, -2);
    dialog_case(aOPrepodavatelq, -3);
    dialog_case(aOPersonajax, -4);
    dialog_case(aObAtoiProgramm, -5);
    dialog_case(aSpasiboNicego, -100);

    GotoXY(1, 0x0E);
    TextColor(7);
    writeln(aCtoTebqInteres);

    const res = await dialog_run(1, 0x0F);
    if (res === -1) {
        help_page = 1;
    } else if (res === -2) {
        help_page = 3;
    } else if (res === -3) {
        help_page = 4;
    } else if (res === -4) {
        help_page = 5;
    } else if (res === -5) {
        help_page = 6;
    } else if (res === -10) {
        help_page = 2;
    } else if (res === -100) {
        help_page = 0;
    }
} // end function 1346B


const aEstVsego6Dnei_ = "\x07Есть всего \x0E6 дней\x07. За это время надо успеть получить \x0E6 зачетов\x07.";
const aCtobiPolucitZa = "Чтобы получить \x0Eзачет\x07, можно успешно сдать сколько-то \x0Eзаданий\x07.";
const aCtobiSdatNesko = "Чтобы сдать несколько заданий, можно чего-то знать и \x0Eприйти к преподу\x07.";
const aCtobiCegoToZna = "Чтобы чего-то знать, можно \x0Eготовиться\x07.";
const aPrepodavatelei = "Преподавателей надо искать по \x0Eрасписанию\x07.";
const aPokaGotovisSqI = "Пока готовишься или сдаешь, \x0Eсамочуствие\x07 ухудшается.";
const aCtobiUlucsitSa = "Чтобы улучшить самочуствие, можно \x0Eотдыхать\x07.";
const aVsqkieDopolnit = "Всякие \x0Eдополнительные персонажи\x07 могут помогать, а могут мешать.";
const aAlTernativnieV = "\x0CАльтернативные варианты есть почти везде, но они тоже чего-то стоят\x07.";


function help_overview() {
    output_colored_string(aEstVsego6Dnei_);
    output_colored_string(aCtobiPolucitZa);
    output_colored_string(aCtobiSdatNesko);
    output_colored_string(aCtobiCegoToZna);
    output_colored_string(aPrepodavatelei);
    output_colored_string(aPokaGotovisSqI);
    output_colored_string(aCtobiUlucsitSa);
    output_colored_string(aVsqkieDopolnit);
    output_colored_string(aAlTernativnieV);
} // end function 1375C


const aVLevomVerxnemU = "\x07В левом верхнем углу - игровые \x0Eдата\x07 и \x0Eвремя\x07,";
const aTvoeSostoqnieZ = "\x07твое состояние (\x0Eздоровье\x07, \x0Eкачества\x07), \x0Eденьги\x07.";
const aVPravomVerxnem = "\x07В правом верхнем углу - твои \x0Eнавыки\x07 по предметам.";
const aNavikiOcenivau = "\x07Навыки оцениваются двояко: по \x0E\"общей шкале\"\x07 (число)";
const aIPoSkaleTrebov = "\x07и по \x0Eшкале требований конкретного преподавателя\x07 (\"оценка\").";
const aNijeNavikovMin = "\x07Ниже навыков - мини-расписание на этот день + сданные задачи.";
const aPolnoeRaspisan = "\x07Полное расписание можно посмотреть в общаге (выбрать в меню).";
const aNakonecSlevaVN = "\x07Наконец, слева в нижней половине экрана - текущее меню.";
const aSostoqnieNavik = " \x0AСОСТОЯНИЕ     \x0FНАВЫКИ";
const aSituaciq = " \x0EСИТУАЦИЯ";
const aMenuRaspisanie = " \x0BМЕНЮ          \x0CРАСПИСАНИЕ";


function help_screen() {
    output_colored_string(aVLevomVerxnemU);
    output_colored_string(aTvoeSostoqnieZ);
    output_colored_string(aVPravomVerxnem);
    output_colored_string(aNavikiOcenivau);
    output_colored_string(aIPoSkaleTrebov);
    output_colored_string(aNijeNavikovMin);
    output_colored_string(aPolnoeRaspisan);
    output_colored_string(aNakonecSlevaVN);
    writeln();
    output_colored_string(aSostoqnieNavik);
    output_colored_string(aSituaciq);
    output_colored_string(aMenuRaspisanie);
    writeln();
} // end function 139B9


const aVObsageTiGotov = "\x07В \x0Eобщаге\x07 ты готовишься и отдыхаешь.";
const aNaFakulTetePun = "На \x0Eфакультете(~=ПУНК)\x07 ты бегаешь по преподам и ищешь приятелей.";
const aCtobiPopastVKo = "Чтобы попасть в \x0Eкомпьюетрный класс\x07, надо прийти на факультет.";
const aVKompUternomKl = "В компьютерном классе ты сдаешь зачет по информатике и ищешь друзей.";
const aMavzoleiAtoTak = "\x0EМавзолей\x07 - это такая столовая. Там ты отдыхаешь и ищешь приятелей.";
const aPomiPeterburgs = "\x0EПОМИ\x07 - Петербургское Отделение Математического Института РАН.";
const aVPomiTiBudesIs = "В ПОМИ ты будешь искать преподов и приятелей.";
const aVPomiNadoExatN = "В ПОМИ надо ехать на электричке, это занимает \x0E1 час\x07.";
const aEsliExatZaicem = "Если ехать зайцем - то может оказаться, что и \x0E2 часа\x07.";
const aKromeTogoPoezd = "Кроме того, \x0Cпоездка отнимает и здоровье тоже\x07.";


function help_places() {
    output_colored_string(aVObsageTiGotov);
    output_colored_string(aNaFakulTetePun);
    output_colored_string(aCtobiPopastVKo);
    output_colored_string(aVKompUternomKl);
    output_colored_string(aMavzoleiAtoTak);
    output_colored_string(aPomiPeterburgs);
    output_colored_string(aVPomiTiBudesIs);
    output_colored_string(aVPomiNadoExatN);
    output_colored_string(aEsliExatZaicem);
    output_colored_string(aKromeTogoPoezd);
} // end function 13C75


const aVsemirnovM_a_A = "Всемирнов М.А., алгебра";
const aOcenSerEzniiIV = " - очень серьезный и весьма строгий.";
const aDubcovE_s_Mata = "Дубцов Е.С., матан";
const aNeOcenStrogiiI = " - не очень строгий и с некоторой халявой.";
const aPodkoritovS_s_ = "Подкорытов С.С., геометрия";
const aZamesaetDutkev = " - замещает Дуткевича Ю.Г.. Почти без проблем.";
const aKlimovA_a_Info = "Климов А.А., информатика";
const aBezProblemNoTr = " - без проблем, но трудно найти.";
const aVlasenkoN_p_En = "Влащенко Н.П., English";
const aBezProblemNoSN = " - без проблем, но с некоторым своеобразием.";
const aAlBinskiiE_g_F = "Альбинский Е.Г., Физ-ра";
const aBezProblemNoOt = " - без проблем, но от физ-ры сильно устаешь.";


function help_professors() {
    show_char_description(aVsemirnovM_a_A, aOcenSerEzniiIV);
    show_char_description(aDubcovE_s_Mata, aNeOcenStrogiiI);
    show_char_description(aPodkoritovS_s_, aZamesaetDutkev);
    show_char_description(aKlimovA_a_Info, aBezProblemNoTr);
    show_char_description(aVlasenkoN_p_En, aBezProblemNoSN);
    show_char_description(aAlBinskiiE_g_F, aBezProblemNoOt);
} // end function 13E5C


const aDiamond = "Diamond";
const aAvtorIgriGeroi = " - автор игры \"Герои Мата и Меха\" (MMHEROES), знает всё о ее \"фичах\".";
const aMisa = "Миша";
const aKogdaToAlFaTes = " - когда-то альфа-тестер; понимает в стратегии получения зачетов.";
const aSerj = "Серж";
const aEseOdinAksAlFa = " - еще один экс-альфа-тестер и просто хороший товарищ.";
const aPasa = "Паша";
const aStarosta_Samii = " - староста. Самый нужный в конце семестра человек.";
const aRai = "RAI";
const aProstoiStudent = " - простой студент. Не любит, когда кто-то НЕ ХОЧЕТ ему помогать.";
const aAndru = "Эндрю";
const aToJeStudent_Mo = " - то же студент. Можно попробовать обратиться к нему за помощью.";
const aSasa = "Саша";
const aEseOdinStudent = " - еще один студент; подробно и разборчиво конспектирует лекции.";
const aNil = "NiL";
const aDevuskaIzVolNo = " - девушка из вольнослушателей. Часто эксплуатирует чужие мозги.";
const aKolq = "Коля";
const aStudentBolSoiL = " - студент, большой любитель алгебры и выпивки.";
const aGrisa = "Гриша";
const aStudentPofigis = " - студент-пофигист. Любит пиво и халяву.";
const aKuzMenkoV_g_ = "Кузьменко В.Г.";
const aPrepodaetInfor = " - преподает информатику у другой половины 19-й группы.";
const aDjug = "DJuG";
const aUgadaiteKto = " - угадайте, кто ;)";


function help_characters() {
    show_char_description(aDiamond, aAvtorIgriGeroi);
    show_char_description(aMisa, aKogdaToAlFaTes);
    show_char_description(aSerj, aEseOdinAksAlFa);
    show_char_description(aPasa, aStarosta_Samii);
    show_char_description(aRai, aProstoiStudent);
    show_char_description(aAndru, aToJeStudent_Mo);
    show_char_description(aSasa, aEseOdinStudent);
    show_char_description(aNil, aDevuskaIzVolNo);
    show_char_description(aKolq, aStudentBolSoiL);
    show_char_description(aGrisa, aStudentPofigis);
    show_char_description(aKuzMenkoV_g_, aPrepodaetInfor);
    show_char_description(aDjug, aUgadaiteKto);
} // end function 1419D


const aCrwmmDevelopme = "\x0FCrWMM Development Team:\x07";
const aDmitriiPetrovA = "\x0EДмитрий Петров (aka Diamond)\x07 - автор идеи, главный программист";
const aKonstantinBule = "\x0EКонстантин Буленков \x07- портирование";
const aVanqPavlikTest = "\x0EВаня Павлик \x07- тестирование, веб-страничка";
const aAlekseiRumqnce = "\x0EАлексей Румянцев (aka RAI) \x07- retired веб-мастер";
const aMnenieAvtorovN = "\x07Мнение авторов не всегда совпадает с высказываниями персонажей.";
const aEsliZapustitMm = "\x0BЕсли запустить \x0Fmmheroes\x0B с хоть каким параметром, у тебя будет возможность";
const aVibratLicniiPr = "выбрать личный профиль своего \"героя\"; например,";
const aMmheroesZ11 = "           \x0Ammheroes z#11";
const aPoqvitsqMenusk = "\x0BПоявится менюшка, в которой все и так ясно.";


function help_about() {
    output_colored_string(aCrwmmDevelopme);
    writeln();
    output_colored_string(aDmitriiPetrovA);
    output_colored_string(aKonstantinBule);
    output_colored_string(aVanqPavlikTest);
    output_colored_string(aAlekseiRumqnce);
    output_colored_string(aMnenieAvtorovN);
    writeln();
    output_colored_string(aEsliZapustitMm);
    output_colored_string(aVibratLicniiPr);
    output_colored_string(aMmheroesZ11);
    output_colored_string(aPoqvitsqMenusk);
} // end function 1442E


async function request_help(page) {
    help_page = page;
    while (help_page) {
        ClrScr();
        [help_overview, help_screen, help_places, help_professors, help_characters, help_about][help_page - 1]();
        await select_help_page();
    }
} // end function 144A1


function goto_punk_to_obschaga() {
    current_subject = -1;
    current_place = 4;
} // end function 14500


const aZdraviiSmisl_1 = "Здравый смысл подсказывает тебе, что в такое время";
const aTiTamNikogoU_1 = "ты там никого уже не найдешь.";
const aNeBudemZrqTr_1 = "Не будем зря тратить здоровье на поездку в ПОМИ.";
const aVAlektrickeN_1 = "В электричке нашли бездыханное тело.";
const aDenegUTebqNe_1 = "Денег у тебя нет, пришлось ехать зайцем...";
const aTebqZalovili_1 = "Тебя заловили контролеры!";
const aVisadiliVKra_1 = "Высадили в Красных зорях, гады!";
const aKontroleriJi_1 = "Контролеры жизни лишили.";
const aUfDoexal_1 = "Уф, доехал!";
const aExatZaicem_1 = "Ехать зайцем";
const aCestnoZaplat_1 = "Честно заплатить 10 руб. за билет в оба конца";


async function goto_punk_or_mausoleum_to_pomi() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);

    if (time_of_day > 20) {
        writeln(aZdraviiSmisl_1);
        writeln(aTiTamNikogoU_1);
        writeln(aNeBudemZrqTr_1);
        await wait_for_key();
        return;
    }

    decrease_health(Random(0x0A), aVAlektrickeN_1);

    current_place = Pomi;

    if (hero.money < 0x0A) {

        writeln(aDenegUTebqNe_1);
        if (hero.charizma < Random(0x0A)) {
            writeln(aTebqZalovili_1);
            writeln(aVisadiliVKra_1);
            decrease_health(0x0A, aKontroleriJi_1);
            await hour_pass();
        } else {
            writeln(aUfDoexal_1);
        }

    } else {

        dialog_start();
        dialog_case(aExatZaicem_1, -1);
        dialog_case(aCestnoZaplat_1, -2);
        const res = await dialog_run(1, 0x0C);

        if (res === -1) {
            if (hero.charizma < Random(0x0A)) {
                GotoXY(1, 0x0F);
                writeln(aTebqZalovili_1);
                writeln(aVisadiliVKra_1);
                decrease_health(0x0A, aKontroleriJi_1);
                await hour_pass();
            } else {
                GotoXY(1, 0x0F);
                writeln(aUfDoexal_1);
            }
        } else if (res === -2) {
            hero.money -= 10;
            hero.has_ticket = 1;
        }

    }

    await wait_for_key();
    await hour_pass();

} // end function 1467C


const aBolsaqRasscita = "Болшая, рассчитанная на поток аудитория кажется забитой народом.";
const aZdesPrisutstvu = "Здесь присутствуют не только твои одногруппники,";
const aNoIKakieToNeOc = "но и какие-то не очень знакомые тебе люди";
const aKajetsqPriklad = "(кажется, прикладники со второго курса).";
const aZaStolomOkoloD = "За столом около доски сидит М. А. Всемирнов";
const aIPrinimaetZace = "и принимает зачет у студентов.";
const aTiResaesNeTerq = "Ты решаешь не терять времени даром и присоединиться к остальным.";
const aTiZaxodisVNebo = "Ты заходишь в небольшую аудиторию, забитую народом.";
const aOkoloDoskiSidi = "Около доски сидит весьма своеобразный преподаватель.";
const aSieSvoebrazieP = "Сие своебразие проявляется, в первую очередь, значком";
const aSNadpisUNeStre = "с надписью: \"НЕ СТРЕЛЯЕЙТЕ В ПРЕПОДА - ОБУЧАЕТ КАК УМЕЕТ\".";
const aAViKKomu = "\"А вы к кому? Максим Александрович в аудитории напротив!\"";
const aPoxojeTiNeTuda = "Похоже, ты не туда попал. Ты извиняешься и идешь к Всемирнову.";
const a____0 = "...";


async function show_intro_algebra() {
    ClrScr();
    TextColor(0x0A);

    if (ja(Random(3), 0)) {
        writeln(aBolsaqRasscita);
        writeln(aZdesPrisutstvu);
        writeln(aNoIKakieToNeOc);
        writeln(aKajetsqPriklad);
        writeln(aZaStolomOkoloD);
        writeln(aIPrinimaetZace);
        writeln(aTiResaesNeTerq);
    } else {
        writeln(aTiZaxodisVNebo);
        writeln(aOkoloDoskiSidi);
        writeln(aSieSvoebrazieP);
        writeln(aSNadpisUNeStre);
        writeln(aAViKKomu);
        writeln(aPoxojeTiNeTuda);
    }

    writeln(a____0);
    await ReadKey();
    ClrScr();
} // end function 14B36


const aVObicnoiGruppo = "В обычной \"групповой\" аудитории сидят около 15 человек.";
const aVCentreIxVnima = "В центре их внимания находится Е.С. Дубцов,";
const aPrinimausiiZac = "принимающий зачет по матанализу.";
const aTiPolucaesZada = "Ты получаешь задание и садишься за свободную парту.";
const a____1 = "...";


async function show_intro_matan() {
    ClrScr();
    TextColor(0x0B);
    writeln(aVObicnoiGruppo);
    writeln(aVCentreIxVnima);
    writeln(aPrinimausiiZac);
    writeln(aTiPolucaesZada);
    writeln(a____1);
    await ReadKey();
    ClrScr();
} // end function 14D55


const aNebolSaqPolupu = "Небольшая, полупустая аудитория.";
const aIDoskaISteniIP = "И доска, и стены, и, похоже, даже пол";
const aIspisaniRazlic = "исписаны различными геометрическими утверждениями.";
const aVCentreVsegoAt = "В центре всего этого хаоса находится";
const aIliSkoreePosto = "(или, скорее, постоянно перемещается)";
const aPodkoritovMlad = "Подкорытов-младший.";
const aTiRaduesSqCtoS = "Ты радуешься, что смог застать его на факультете!";
const a____2 = "...";


async function show_intro_git() {
    ClrScr();
    TextColor(9);
    writeln(aNebolSaqPolupu);
    writeln(aIDoskaISteniIP);
    writeln(aIspisaniRazlic);
    writeln(aVCentreVsegoAt);
    writeln(aIliSkoreePosto);
    writeln(aPodkoritovMlad);
    writeln(aTiRaduesSqCtoS);
    writeln(a____2);
    hero.health += 5;
    await ReadKey();
    ClrScr();
} // end function 14EEF


const aNaTretEmAtajeU = "На третьем этаже учебного корпуса Мат-Меха";
const aVOdnoiIzAudito = "в одной из аудиторий, закрепленных за кафедрой иностранных языков,";
const aRaspolojilasN_ = "расположилась Н.П. Влащенко.";
const aSteniKabinetaV = "Стены кабинета выглядят как-то странно.";
const aRqdomSNebolSoi = "Рядом с небольшой доской висит изображение Эйфелевой башни,";
const aCutDalSeStrann = "чуть дальше - странное изображение,";
const aObladauseeNepo = "обладающее непостижимым метафизическим смыслом.";
const aPoxojeSeicasTi = "Похоже, сейчас ты будешь сдавать зачет по английскому.";
const a____3 = "...";


async function show_intro_english() {
    ClrScr();
    TextColor(0x0E);
    writeln(aNaTretEmAtajeU);
    writeln(aVOdnoiIzAudito);
    writeln(aRaspolojilasN_);
    writeln(aSteniKabinetaV);
    writeln(aRqdomSNebolSoi);
    writeln(aCutDalSeStrann);
    writeln(aObladauseeNepo);
    writeln(aPoxojeSeicasTi);
    writeln(a____3);
    await ReadKey();
    ClrScr();
} // end function 1513F




async function show_intro_fizra_lecture() {
    const aAlBinskiiProvo = "Альбинский проводит лекцию о пользе бега";
    const aDlqNarodnogo = "для народного хозяйства.";
    const aDlqLicnoiJizni = "для личной жизни.";
    const aDlqNaucnoi = "для научной работы.";
    const aDlqKommunistic = "для коммунистического строительства.";
    const aDlqUcebiIDosug = "для учебы и досуга.";
    const aDlqSpaseniqOtK = "для спасения от контроллеров.";
    const aPoxojeOnKakVse = "Похоже, он, как всегда, немного увлекся.";
    const aNemnogoVNasemS = "Немного в нашем случае - 1 час.";

    writeln(aAlBinskiiProvo);
    const phrases = [aDlqNarodnogo, aDlqLicnoiJizni, aDlqNaucnoi, aDlqKommunistic, aDlqUcebiIDosug, aDlqSpaseniqOtK];
    writeln(RandomPhrase(phrases));
    ++timesheet[day_of_week][Fizra].to;
    writeln();
    writeln(aPoxojeOnKakVse);
    writeln(aNemnogoVNasemS);
    writeln();
    await hour_pass();
} // end function 1532A


const aAlBinskiiProsi = "Альбинский просит тебя замерить пульс.";
const aNazvavPervoePr = "Назвав первое пришедшее в замученную математикой голову число,";
const aTiOtpravlqesSq = "ты отправляешься мотать круги в парке,";
const aVKotoromVoobse = "в котором, вообще-то, \"запрещены спортивные мероприятия\".";
const a____4 = "...";


async function show_intro_fizra() {
    ClrScr();
    TextColor(0x0F);
    if (Random(3) === 0) {
        await show_intro_fizra_lecture();
    }
    writeln(aAlBinskiiProsi);
    writeln(aNazvavPervoePr);
    writeln(aTiOtpravlqesSq);
    writeln(aVKotoromVoobse);
    writeln(a____4);
    await ReadKey();
    ClrScr();
} // end function 15514


async function goto_exam_with_intro(subj) {
    if (subj === Algebra) {
        await show_intro_algebra();
    } else if (subj === Matan) {
        await show_intro_matan();
    } else if (subj === GiT) {
        await show_intro_git();
    } else if (subj === English) {
        await show_intro_english();
    } else if (subj === Fizra) {
        await show_intro_fizra();
    }
} // end function 155AF


const aTiSeicasNaFaku = "Ты сейчас на факультете. К кому идти?";
const aNiKKomu = "Ни к кому";


async function select_professor_punk() {
    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);
    writeln(aTiSeicasNaFaku);

    dialog_start();
    for (let i = 0; i <= 5; ++i) {
        if (is_professor_here(i)) {
            dialog_case(subjects[i].professor.name, i);
        }
    }
    dialog_case(aNiKKomu, -1);
    current_subject = await dialog_run(1, 0x0A);

    if (Random(2) === 0) {
        await goto_exam_with_intro(current_subject);
    }
} // end function 15623


async function look_baobab_punk() {
    await show_top_gamers();
} // end function 156B8


const aUmerPoPutiVM_1 = "Умер по пути в мавзолей.";


function goto_punk_to_mausoleum() {
    current_subject = -1;
    current_place = 5;
    decrease_health(3, aUmerPoPutiVM_1);
} // end function 156DB


const aUpalSLestniciU = "Упал с лестницы у главного входа.";


function goto_punk_to_kompy() {
    current_place = 3;
    current_subject = -1;
    decrease_health(2, aUpalSLestniciU);
} // end function 15719


const aIk = " <йк> ";


function output_ik_string(s) {
    const terkom_line = [0xA, 0xE, 0x10, 0x12];
    let iks = 5 - _upper_bound(terkom_line, time_of_day);

    for (let i = 1; i <= s.length; ++i) {
        if (s[i - 1] == " " && Random(iks) == 0) {
            write(aIk);
            --iks;
            if (iks < 1) {
                iks = 2;
            }
        } else {
            write(s[i - 1]);
        }
    }

} // end function 1573C


const aSkazanoJeNetSv = "\"Сказано же, нет свободных компов!\"";
const aIzviniParenSvo = "\"Извини, парень, свободных кумпутеров нет.";
const aPoidiPoucisPok = "Пойди поучись пока.\"";
const aTiSidisZaSvobo = "Ты сидишь за свободным компом";
const aVTerexovskoiKo = "в тереховской \"конторе\".";
const aCtoDelatBudem = "Что делать будем?";
const aSidetIZarabati = "Сидеть и зарабатывать деньги";
const aPoigratVMmhe_0 = "Поиграть в MMHEROES";
const aPosidetCasokVI = "Посидеть часок в Inet'e";
const aViitiOtsudaNaS = "Выйти отсюда на \"свежий воздух\"";
const aTebeNakapalo = "Тебе накапало ";
const aRub__0 = " руб.";
const aSgorelNaRabote = "Сгорел на работе.";
const aUxodim___ = "Уходим ...";
const aPoNeizvestnoiP = "По неизвестной причине, в помещении ТЕРКОМА";
const aMmheroesNeOkaz = "MMHEROES не оказывают никакого метафизического воздействия";
const aNaOkrujausiiMi = "на окружающий мир...";
const aOglqdevsisVo_0 = "Оглядевшись вокруг, ты обнаруживаешь,";
const aCtoVseTovarisi = "что все товарищи, здесь собравшиеся,";
const aRubqtsqVMmhero = "РУБЯТСЯ В MMHEROES!";
const aVozmojnoOniVse = "Возможно, они все пытаются халявить,";
const aPitautsqIgratP = "пытаются играть по \"тривиальному\" алгоритму,";
const aKotoriiSrabati = "который срабатывает, увы, далеко, не всегда...";
const aVotZdorovoMiSi = "Вот здорово - мы сидим, а денежки-то идут!";
const aRabociiDenZako = "Рабочий день закончился, все по домам.";


// =============================================================================


async function go_to_terkom() {

    if (!terkom_has_places) {
        ClrScr();
        show_header_stats();
        GotoXY(1, 8);
        TextColor(0x0B);
        output_ik_string(aSkazanoJeNetSv);
        writeln();
        await wait_for_key();
        ClrScr();
        return;
    }

    if (Random(3) > 0) {
        ClrScr();
        show_header_stats();
        GotoXY(1, 8);
        TextColor(0x0A);
        output_ik_string(aIzviniParenSvo);
        writeln();
        output_ik_string(aPoidiPoucisPok);
        writeln();
        terkom_has_places = false;
        await wait_for_key();
        ClrScr();
        return;
    }


    do {

        ClrScr();
        show_header_stats();
        GotoXY(1, 8);
        writeln(aTiSidisZaSvobo);
        writeln(aVTerexovskoiKo);
        writeln(aCtoDelatBudem);
        dialog_start();
        dialog_case(aSidetIZarabati, -1);

        if (hero.has_mmheroes_disk) {
            dialog_case(aPoigratVMmhe_0, -10);
        }

        if (hero.has_inet) {
            dialog_case(aPosidetCasokVI, -11);
        }

        dialog_case(aViitiOtsudaNaS, -2);
        show_short_today_timesheet(8);

        const ax = await dialog_run(1, 0x0C);
        if (jz(ax, -1)) {

            let var_2 = Random(Random(hero.charizma + hero.brain)) + 1;

            while (var_2 > 4) {
                var_2 = Random(var_2 - 3) + 2;
            }

            TextColor(7);
            GotoXY(1, 0x13);
            output_ik_string(aTebeNakapalo);
            TextColor(0x0F);

            write(var_2);

            TextColor(7);
            writeln(aRub__0);

            hero.money += var_2;
            decrease_health(Random(var_2 * 2), aSgorelNaRabote);
            await wait_for_key();
            await hour_pass();

        } else if (ax === -2) {
            GotoXY(1, 0x11);
            output_ik_string(aUxodim___);
            writeln();
            await wait_for_key();
            ClrScr();
            return;
        } else if (jz(ax, -10)) {
            ClrScr();
            TextColor(0x0B);
            output_ik_string(aPoNeizvestnoiP);
            writeln();
            output_ik_string(aMmheroesNeOkaz);
            writeln();
            output_ik_string(aNaOkrujausiiMi);
            writeln();
            await ReadKey();
            output_ik_string(aOglqdevsisVo_0);
            writeln();
            output_ik_string(aCtoVseTovarisi);
            writeln();
            writeln(aRubqtsqVMmhero);
            output_ik_string(aVozmojnoOniVse);
            writeln();
            output_ik_string(aPitautsqIgratP);
            writeln();
            output_ik_string(aKotoriiSrabati);
            writeln();
            writeln();
            await wait_for_key();
            ClrScr();
        } else if (jz(ax, -11)) {

            GotoXY(1, 0x13);
            writeln(aVotZdorovoMiSi);

            let var_2 = Random(Random(hero.charizma + hero.brain)) + 1;

            while (var_2 > 4) {
                var_2 = Random(var_2 - 3) + 2;
            }

            TextColor(7);
            GotoXY(1, 0x14);
            output_ik_string(aTebeNakapalo);
            TextColor(0x0F);
            write(var_2);
            TextColor(7);
            writeln(aRub__0);
            hero.money += var_2;
            await wait_for_key();
            await hour_pass();

        }

    } while (time_of_day <= 18);

    GotoXY(1, 0x14);
    output_ik_string(aRabociiDenZako);
    await wait_for_key();

} // end function 15B3A


const aCtoBratBudem = "Что брать будем?";
const aCaiZa2R_ = "Чай за 2 р.";
const aKeksZa4R_ = "Кекс за 4 р.";
const aCaiIVipecku6R_ = "Чай и выпечку, 6 р.";
const aProstoPosijuSP = "Просто посижу с приятелями.";
const aQVoobseZrqSuda = "Я вообще зря сюда зашел.";


async function go_to_cafe() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    writeln(aCtoBratBudem);
    show_short_today_timesheet(0x0B);
    dialog_start();

    if (hero.money >= 2) {
        dialog_case(aCaiZa2R_, -1);
    }

    if (hero.money >= 4) {
        dialog_case(aKeksZa4R_, -2);
    }

    if (hero.money >= 6) {
        dialog_case(aCaiIVipecku6R_, -3);
    }

    dialog_case(aProstoPosijuSP, -4);
    dialog_case(aQVoobseZrqSuda, 0);
    const ax = await dialog_run(1, 0x0B);

    if (ax === -1) {
        hero.money -= 2;
        hero.health += Random(hero.charizma) + 2;
    } else if (ax === -2) {
        hero.money -= 4;
        hero.health += Random(hero.charizma) + 4;
    } else if (ax === -3) {
        hero.money -= 6;
        hero.health += Random(hero.charizma) + 7;
    } else if (ax === -4) {
        hero.health += Random(hero.charizma);
    } else if (ax === 0) {
        return;
    }

    await hour_pass();
} // end function 15F9B


const aTiNaFakulTete_ = "Ты на факультете. Что делать?";
const aIdtiKPrepodu = "Идти к преподу";
const aPosmotretNaBao = "Посмотреть на баобаб";
const aPoitiVObsagu_0 = "Пойти в общагу";
const aPoexatVPomi_2 = "Поехать в ПОМИ";
const aPoitiVMavzol_1 = "Пойти в мавзолей";
const aPoitiVKompUter = "Пойти в компьютерный класс";
const aSxoditVKafe = "Сходить в кафе";
const aPoitiVTerkomPo = "Пойти в ТЕРКОМ, поработать";
const aSMenqXvatit_2 = "С меня хватит!";


async function scene_punk() {
    show_header_stats();
    TextColor(7);
    show_short_today_timesheet(0x0A);
    GotoXY(1, 8);
    writeln(aTiNaFakulTete_);
    dialog_start();
    dialog_case(aIdtiKPrepodu, -1);
    dialog_case(aPosmotretNaBao, -2);
    dialog_case(aPoitiVObsagu_0, -3);
    dialog_case(aPoexatVPomi_2, -4);
    dialog_case(aPoitiVMavzol_1, -5);

    if (time_of_day < 20) {
        dialog_case(aPoitiVKompUter, -7);
    }

    if (time_of_day >= 10 && time_of_day <= 18) {
        dialog_case(aSxoditVKafe, -12);
    }


    for (let i = 0; i <= 0xB; ++i) {

        if (classmates[i].place === Punk) {
            if (classmates[i].current_subject === -1) {
                dialog_case_colored(classmate_names[i], i, 0xE);
            }
        }

    }

    if (hero.is_working_in_terkom && time_of_day <= 18) {
        dialog_case(aPoitiVTerkomPo, -10);
    }

    dialog_case_colored(aSMenqXvatit_2, -6, 9);

    const res = await dialog_run(1, 0x0A);

    if (res === -1) {
        await select_professor_punk();
    } else if (res === -2) {
        await look_baobab_punk();
    } else if (res === -3) {
        await goto_punk_to_obschaga();
    } else if (res === -4) {
        await goto_punk_or_mausoleum_to_pomi();
    } else if (res === -5) {
        await goto_punk_to_mausoleum();
    } else if (res === -6) {
        await request_exit();
    } else if (res === -7) {
        await goto_punk_to_kompy();
    } else if (res === -10) {
        await go_to_terkom();
    } else if (res === -12) {
        await go_to_cafe();
    } else if (!jl(res, 0) && !jg(res, 0x0B)) {
        await talk_with_classmate(res);
    }

} // end function 16167


async function algebra_pomi_intro() {
    const aMalenKiiKabine = "Маленький кабинет в ПОМИ заполнен людьми.";
    const aIKakNiStrannoP = "И, как ни странно, почти все они хотят одного и того же.";
    const aPoxojeTiTojeXo = "Похоже, ты тоже хочешь именно этого -";
    const aRazdelatSqNako = "РАЗДЕЛАТЬСЯ НАКОНЕЦ С ЗАЧЕТОМ ПО АЛГЕБРЕ!";
    const a____5 = "...";

    ClrScr();
    TextColor(0x0C);
    writeln(aMalenKiiKabine);
    writeln(aIKakNiStrannoP);
    writeln(aPoxojeTiTojeXo);
    writeln(aRazdelatSqNako);
    writeln(a____5);
    await wait_for_key();
    ClrScr();
} // end function 163B7


async function git_pomi_intro() {
    const aVNebolSomPomis = "В небольшом ПОМИшном кабинете собралось человек 10 студентов.";
    const aKromeNixVKomna = "Кроме них, в комнате ты видишь Подкорытова-младшего,";
    const aATakjePolnogoS = "а также - полного седоволосого лысеющего господина,";
    const aIzdausegoXarak = "издающего характерные пыхтящие звуки.";
    const aTiNadeesSqCtoV = "Ты надеешься, что все это скоро кончится...";
    const a____6 = "...";

    ClrScr();
    writeln(aVNebolSomPomis);
    writeln(aKromeNixVKomna);
    writeln(aATakjePolnogoS);
    writeln(aIzdausegoXarak);
    writeln(aTiNadeesSqCtoV);
    writeln(a____6);
    await ReadKey();
    ClrScr();
} // end function 1653F


async function pomi_intro(subj) {
    if (subj === Algebra) {
        await algebra_pomi_intro();
    } else if (subj === GiT) {
        await git_pomi_intro();
    }
} // end function 165D9


async function select_professor_pomi() {
    const aTiSeicasVPomi_ = "Ты сейчас в ПОМИ. К кому идти?";
    const aNiKKomu_0 = "Ни к кому";

    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);
    writeln(aTiSeicasVPomi_);
    dialog_start();

    for (let subj = 0; subj <= 5; ++subj) {
        if (is_professor_here(subj)) {
            dialog_case(subjects[subj].professor.name, subj);
        }
    }

    dialog_case(aNiKKomu_0, -1);
    current_subject = await dialog_run(1, 0x0A);

    if (Random(2) === 0) {
        await pomi_intro(current_subject);
    }
} // end function 16622


async function look_board_pomi() {
    await show_top_gamers();
} // end function 166B7


const aCtoBratBudem_0 = "Что брать будем?";
const aKofeZa2R_ = "Кофе за 2 р.";
const aKorjZa4R_ = "Корж за 4 р.";
const aKofeIVipecku6R = "Кофе и выпечку, 6 р.";
const aNicegoProstoPr = "Ничего, просто просидеть здесь часок.";
const aSovsemNicego_B = "Совсем ничего. Бывает.";


async function pomi_cafe() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    writeln(aCtoBratBudem_0);
    show_short_today_timesheet(0x0A);
    dialog_start();

    if (!jl(hero.money, 2)) {
        dialog_case(aKofeZa2R_, -1);
    }

    if (!jl(hero.money, 4)) {
        dialog_case(aKorjZa4R_, -2);
    }

    if (!jl(hero.money, 6)) {
        dialog_case(aKofeIVipecku6R, -3);
    }

    dialog_case(aNicegoProstoPr, -4);
    dialog_case(aSovsemNicego_B, 0);

    const ax = await dialog_run(1, 0x0A);
    if (ax == -1) {
        hero.money -= 2;
        hero.health += Random(hero.charizma) + 3;
    } else if (ax == -2) {
        hero.money -= 4;
        hero.health += Random(hero.charizma) + 6;
    } else if (ax == -3) {
        hero.money -= 6;
        hero.health += Random(hero.charizma) + 0x0A;
    } else if (ax == -4) {
        hero.health += Random(hero.charizma);
    } else if (ax == 0) {
        return;
    }

    await hour_pass();

} // end function 1673E


const aEdemVPunkBilet = "Едем в ПУНК, билета нет. Будем покупать билет (5 рублей)?";
const aDaBudem = "Да, будем";
const aNetNeBudem = "Нет, не будем";
const aVAlektrickeN_2 = "В электричке нашли бездыханное тело.";
const aEdemZaicem___ = "Едем зайцем... ";
const aKontroleriPoim = "Контролеры поймали! Высадили в Красных Зорях!";
const aKontroleriJi_2 = "Контролеры жизни лишили.";


async function go_pomi_to_punk() {

    if (!hero.has_ticket && hero.money >= 5) {
        ClrScr();
        show_header_stats();
        show_short_today_timesheet(0x0A);
        GotoXY(1, 8);
        TextColor(0x0E);
        writeln(aEdemVPunkBilet);
        dialog_start();
        dialog_case(aDaBudem, -1);
        dialog_case(aNetNeBudem, -2);
        const ax = await dialog_run(1, 0x0A);

        if (ax === -1) {
            hero.money -= 5;
            hero.has_ticket = 1;
        }
    }

    decrease_health(Random(0x0A), aVAlektrickeN_2);
    current_place = Punk;

    if (!hero.has_ticket) {
        GotoXY(1, 0x16);
        write(aEdemZaicem___);

        if (hero.charizma < Random(0x0A)) {
            writeln(aKontroleriPoim);
            decrease_health(0x0A, aKontroleriJi_2);
            await hour_pass();
        }
        await wait_for_key();
    }

    await hour_pass();
    hero.has_ticket = 0;
} // end function 16914


const aTiVPomi_CtoDel = "Ты в ПОМИ. Что делать?";
const aIdtiKPrepodu_0 = "Идти к преподу";
const aPosmotretNaDos = "Посмотреть на доску объявлений";
const aPoitiVKafe = "Пойти в кафе";
const aPoexatVPunk = "Поехать в ПУНК";
const aSMenqXvatit_3 = "С меня хватит!";


async function scene_pomi() {
    show_header_stats();
    TextColor(7);
    GotoXY(1, 8);
    writeln(aTiVPomi_CtoDel);
    dialog_start();
    dialog_case(aIdtiKPrepodu_0, -1);
    dialog_case(aPosmotretNaDos, -2);
    dialog_case(aPoitiVKafe, -3);
    dialog_case(aPoexatVPunk, -4);

    for (let i = 0; i <= 0xB; ++i) {
        if (classmates[i].place === Pomi && classmates[i].current_subject === -1) {
            dialog_case_colored(classmate_names[i], i, 0xE);
        }
    }

    dialog_case_colored(aSMenqXvatit_3, -5, 9);
    show_short_today_timesheet(0x0A);
    const res = await dialog_run(1, 0x0A);

    if (res === -1) {
        await select_professor_pomi();
    } else if (res === -2) {
        await look_board_pomi();
    } else if (res === -3) {
        await pomi_cafe();
    } else if (res === -4) {
        await go_pomi_to_punk();
    } else if (res === -5) {
        await request_exit();
    } else if (!jl(res, 0) && !jg(res, 0x0B)) {
        await talk_with_classmate(res);
    }

} // end function 16A91

/* unused
const aMmheroes_hi = "mmheroes.hi";
const aKolq_0 = "Коля";
const aSasa_0 = "Саша";
const aAndru_0 = "Эндрю";
const aPasa_0 = "Паша";
const aGrisa_0 = "Гриша";
*/


function read_top_gamers() {

} // end function 16BD7


const aPozdravlqu = "********************** ПОЗДРАВЛЯЮ! ***************************";
const aTiPopalVSkrija = "Ты попал в скрижали Мат-Меха! Сейчас тебя будут увековечивать!";
const aNeBoisqAtoNeBo = "Не бойся, это не больно.";
const aKakTebqZovutGe = "Как тебя зовут, герой? ";
const aNeXocesUvekove = "Не хочешь увековечиваться - не надо!";
const aNuVotIVse_ = "Ну, вот и все.";


async function update_top_gamers(score) {
    // var var_108;
    // svar var_106;

    /*
    const my_place = -1;
	for (let i = 4; i >= 0; --i) {
		if (top_gamers[i].score >= score) {
			my_place = i;
			break;
		}
	}

	if (my_place == 4) {
		return;
	}
	*/

    TextColor(0x0F);
    writeln(aPozdravlqu);
    writeln(aTiPopalVSkrija);
    writeln(aNeBoisqAtoNeBo);
    writeln();
    write(aKakTebqZovutGe);
    TextColor(0x0A);
    const my_name = await readln();

    if (my_name) {
        TextColor(0x0F);
        writeln();
        writeln(aNeXocesUvekove);
        return;
    }

    set_user_name(my_name);

    /*
	++my_place;
	if (my_place <= 3) {
		for (let i = 3; i >= my_place; --i) {
			top_gamers[i + 1] = top_gamers[i];
		}
	}

	top_gamers[my_place] = {name: my_name, score: score};
	*/

    send_replay({score: score});

    writeln();
    TextColor(0x0F);
    writeln(aNuVotIVse_);
    writeln();
} // end function 16D8E




function write_top_gamers() {
    /*
	var var_82;
	var var_80;

    const aMmheroes_hi_0 = "mmheroes.hi";
	Assign(var_80, aMmheroes_hi_0);
	Rewrite(var_80, 0x23);

	for (var_82 = 0; var_82 <= 4; ++var_82) {
		Write(var_80, top_gamers[var_82]);
	}

	Close(var_80);
*/
} // end function 16F39


const asc_16F8F = "******                                           ******";
const asc_16FC7 = "      *********                         *********";
const asc_16FF9 = "               *************************";
const aVotImenaTexKto = "Вот имена тех, кто прошел это наводящее ужас испытание:";
const aGeroiZarabotal = "    ГЕРОЙ            ЗАРАБОТАЛ";
const aRub__1 = " руб.";


async function show_top_gamers() {
    ClrScr();
    TextColor(0x0F);
    writeln(asc_16F8F);
    writeln(asc_16FC7);
    writeln(asc_16FF9);
    TextColor(0x0E);
    writeln(aVotImenaTexKto);
    writeln();
    writeln(aGeroiZarabotal);

    for (let i = 0; i < top_gamers.length; ++i) {

        TextColor(0x0F);
        GotoXY(4, i + 7);
        write(top_gamers[i].name);
        GotoXY(0x19, i + 7);
        write(top_gamers[i].score);
        write(aRub__1);

    }

    GotoXY(1, 0x14);
    TextColor(7);
    await wait_for_key();
} // end function 1707F


async function exam_ends_common() {
    const aZaderjivaetsqE = " задерживается еще на час.";
    const aUxodit_ = " уходит.";

    if (hero.health <= 0) {
        return;
    }

    ClrScr();
    show_header_stats();
    GotoXY(1, 0x17);
    TextColor(0x0C);

    if (subjects[current_subject].member0xFA * 5 + time_of_day * 6 < hero.charizma * 3 + Random(60) + 20) {

        write(subjects[current_subject].professor.name);
        write(aZaderjivaetsqE);
        timesheet[day_of_week][current_subject].to = time_of_day + 1;

    } else {

        write(subjects[current_subject].professor.name);
        write(aUxodit_);
        current_subject = -1;

    }

    await wait_for_key();
} // end function 171C4


const aUviPomiUjeZakr = "Увы, ПОМИ уже закрыто, поэтому придется ехать домой...";
const aTiVPitereNaBal = "Ты в Питере, на Балтийском вокзале.";
const aKudaNapravlqem = "Куда направляемся?";
const aDomoiVPunk = "Домой, в ПУНК!";
const aXocuVPomi = "Хочу в ПОМИ!";
const aXorosoBiletEst = "Хорошо, билет есть...";
const aTebqZalovili_2 = "Тебя заловили контролеры!";
const aVisadiliVKra_2 = "Высадили в Красных зорях, гады!";
const aKontroleriJi_3 = "Контролеры жизни лишили.";
const aUfDoexal___ = "Уф, доехал...";


async function na_vokzale() {
    let place;

    ClrScr();
    if (time_of_day > 20) {
        TextColor(0x0E);
        writeln(aUviPomiUjeZakr);
        place = Obshaga;
    } else {
        show_header_stats();
        current_subject = -1;
        GotoXY(1, 0x0C);
        TextColor(0x0B);
        writeln(aTiVPitereNaBal);
        writeln(aKudaNapravlqem);
        show_short_today_timesheet(0x0C);
        dialog_start();
        dialog_case(aDomoiVPunk, -1);
        dialog_case(aXocuVPomi, -2);
        place = await dialog_run(1, 0x0F) === -1 ? Punk : Pomi;
    }

    if (place === Punk) {
        GotoXY(1, 0x14);
        if (hero.has_ticket) {
            writeln(aXorosoBiletEst);
        } else if (hero.charizma < Random(0x0A)) {
            writeln(aTebqZalovili_2);
            writeln(aVisadiliVKra_2);
            decrease_health(0x0A, aKontroleriJi_3);
            await hour_pass();
            await wait_for_key();
            ClrScr();
        } else {
            writeln(aUfDoexal___);
        }
        await hour_pass();
    }

    current_place = place;
} // end function 173B6


const aVsemirnovPrini = "Всемирнов принимает зачет даже в электричке!";
const aMucaesSq___ = "Мучаешься ...";
const aZamucil = " замучил";
const aA = "а";
const a_ = ".";
const aTvoiMuceniqBil = "Твои мучения были напрасны.";
const aTebeZacliEse = "Тебе зачли еще ";


async function algebra_in_train() {
    // var var_106;

    ClrScr();
    show_header_stats();
    GotoXY(1, 0x0E);
    writeln(aVsemirnovPrini);
    TextColor(0x0D);
    writeln(aMucaesSq___);
    TextColor(7);
    writeln();

    const smart = hero.subject[current_subject].knowledge - subjects[current_subject].member0xFA + Random(hero.brain);
    let task_done = idiv(smart * 3, 4);

    if (hero.health <= 5) {
        task_done -= Random(5 - hero.health);
    }

    if (task_done > 0) {
        task_done = Round(Sqrt(task_done) / subjects[current_subject].member0x100);
    } else {
        task_done = 0;
    }

    if (hero.subject[current_subject].tasks_done + task_done > subjects[current_subject].tasks) {
        task_done = subjects[current_subject].tasks - hero.subject[current_subject].tasks_done;
    }

    let knowledge_drop = Random(hero.stamina) - Random(subjects[current_subject].member0xFA);
    if (knowledge_drop > 0) {
        knowledge_drop = 0;
    }

    hero.subject[current_subject].knowledge += knowledge_drop;
    if (hero.subject[current_subject].knowledge < 0) {
        hero.subject[current_subject].knowledge = 0;
    }

    let health_drop = Random(idiv(hero.stamina * 2, 3)) - subjects[current_subject].member0xFC;
    if (health_drop > 0) {
        health_drop = 0;
    }

    hero.health += health_drop;
    if (hero.health <= 0) {
        is_end = true;
        death_cause = subjects[current_subject].professor.name + aZamucil;
        if (subjects[current_subject].professor.sex === Female) {
            death_cause += aA;
        }
        death_cause += a_;
    } else {

        GotoXY(1, 0x15);

        if (task_done === 0) {
            colored_output(0x0C, aTvoiMuceniqBil);
        } else {
            colored_output(0x0A, aTebeZacliEse);
            colored_output_white(task_done);
            TextColor(0x0A);
            zadanie_in_case(task_done);
            write("!");
            TextColor(7);
        }

        hero.subject[current_subject].tasks_done += task_done;
        await wait_for_key();
        await hour_pass();
    }

    await na_vokzale();
} // end function 175A6


const aM_a_Vsemirnov = "М.А. Всемирнов :";
const aNetSegodnqQBol = "\"Нет, сегодня я больше никому ничего не засчитаю...\"";
const aUslisavAtuFraz = "Услышав эту фразу, ты осознаешь беспочвенность своих мечтаний";
const aOSdaceZacetaPo = "о сдаче зачета по алгебре в электричке.";
const aEstNadejdaCtoV = "Есть надежда, что в электричке удастся что-то еще решить.";
const aPravdaZacetnoi = "Правда, зачетной ведомости с собой туда не взять...";
const aDenegUTebqNe_2 = "Денег у тебя нет, пришлось ехать зайцем...";
const aTebqZalovili_3 = "Тебя заловили контролеры!";
const aVisadiliVKra_3 = "Высадили в Красных зорях, гады!";
const aKontroleriJi_4 = "Контролеры жизни лишили.";
const aExatZaicem_2 = "Ехать зайцем";
const aCestnoZaplat_2 = "Честно заплатить 10 руб. за билет в оба конца";
const aKontrolleriKon = "Контроллеры, контроллеры, контроллеры...";
const aISoVsemirnovim = "И со Всемирновым ты ничего не успел...";


async function go_to_train() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 0x0C);

    if (time_of_day > 20) {
        TextColor(7);
        write(aM_a_Vsemirnov);
        TextColor(0x0F);
        writeln(aNetSegodnqQBol);
        TextColor(0x0E);
        writeln(aUslisavAtuFraz);
        writeln(aOSdaceZacetaPo);
        await wait_for_key();
        current_subject = -1;
        return;
    }

    TextColor(7);
    writeln(aEstNadejdaCtoV);
    writeln(aPravdaZacetnoi);

    if (jl(hero.money, 0x0A)) {

        TextColor(0x0C);
        writeln(aDenegUTebqNe_2);

        if (hero.charizma < Random(0x0A)) {

            TextColor(0x0D);
            writeln(aTebqZalovili_3);
            writeln(aVisadiliVKra_3);
            decrease_health(0x0A, aKontroleriJi_4);
            current_place = 1;
            await wait_for_key();
            ClrScr();
        }

    } else {

        dialog_start();
        dialog_case(aExatZaicem_2, -1);
        dialog_case(aCestnoZaplat_2, -2);
        const ax = await dialog_run(1, 0x11);

        if (ax === -1) {
            hero.has_ticket = 0;

            if (hero.charizma < Random(0x0A)) {
                GotoXY(1, 0x15);
                TextColor(0x0D);
                writeln(aTebqZalovili_3);
                decrease_health(0x0A, aKontrolleriKon);
                writeln(aISoVsemirnovim);
                await wait_for_key();
                ClrScr();
            }
        } else if (ax === -2) {
            hero.money -= -0xA;
            hero.has_ticket = 1;
        }
    }

    await wait_for_key();
    await algebra_in_train();
} // end function 17AA2


async function algebra_ends() {
    const aVseminovM_a_Ux = "Всеминов М.А. уходит.";
    const aPoitiZaNimNaAl = "Пойти за ним на электричку?";
    const aDaQXocuEsePomu = "Да, я хочу еще помучаться";
    const aNuUjNetSpasibo = "Ну уж нет, спасибо!";

    ClrScr();
    show_header_stats();
    TextColor(0x0C);
    GotoXY(1, 0x0C);
    writeln(aVseminovM_a_Ux);

    if (current_place !== Punk || hero.subject[Algebra].tasks_done >= subjects[Algebra].tasks) {
        current_subject = -1;
        await wait_for_key();
    } else {
        writeln(aPoitiZaNimNaAl);
        dialog_start();
        dialog_case(aDaQXocuEsePomu, -1);
        dialog_case(aNuUjNetSpasibo, -2);
        show_short_today_timesheet(0x0C);
        const result = await dialog_run(1, 0x0F);

        if (result === -2) {
            current_place = 1;
            current_subject = -1;
        } else if (result === -1) {
            await go_to_train();
        }
    }
} // end function 17D20


async function exam_ends(subject) {
    if (subject === Algebra) {
        await algebra_ends();
    } else {
        await exam_ends_common();
    }
} // end function 17DD3


async function common_exam_done() {
    const aTvoqZacetkaPop = "Твоя зачетка пополнилась еще одной записью.";
    writeln();
    TextColor(0x0A);
    writeln(aTvoqZacetkaPop);
    TextColor(7);
    await wait_for_key();
    ClrScr();
    show_header_stats();
} // end function 17E1A


const aVsemirnovMedle = "Всемирнов медленно рисует минус ...";
const aITakJeMedlenno = "И так же медленно пририсовывает к нему вертикальную палочку!";
const aUfNuISutockiUN = "Уф! Ну и шуточки у него!";
const aXorosoXotZacet = "Хорошо хоть, зачет поставил...";
const aVsemirnovM_a_I = "Всемирнов М.А. изничтожил.";


async function algebra_done() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    writeln(aVsemirnovMedle);
    await Delay(0x3E8);
    writeln(aITakJeMedlenno);
    writeln(aUfNuISutockiUN);
    writeln(aXorosoXotZacet);
    decrease_health(Random(6), aVsemirnovM_a_I);
    await wait_for_key();
    ClrScr();
    show_header_stats();
} // end function 17F12


function random_color_output(text) {
    TextColor(Random(6) + 9);
    writeln(text);
    TextColor(7);
} // end function 17FAD


const aVlasenkoN_p_ = "Влащенко Н.П.:";
const aZakroiteGlaza_ = "\"Закройте глаза ...\"";
const aTiPoslusnoZakr = "Ты послушно закрываешь глаза.";
const aOktroiteGlaza_ = "\"Октройте глаза ...\"";
const aTiVidisVlasenk = "Ты видишь Влащенко Н.П. в костюме сказочной феи.";
const aVlasenkoN_p_Ka = "Влащенко Н.П. касается тебя указкой (она же - волшебная палочка ...)";
const aTiCuvstvuesCto = "Ты чувствуешь, что с тобой происходит что-то сверхъестественное.";
const aTebeSilNoPoplo = "Тебе сильно поплохело.";
const aFeqBilaQvnoNeV = "Фея была явно не в настроении.";
const aTiPocuvstvoval = "Ты почувствовал себя где-то в другом месте.";
const aTiCuvstvuesC_0 = "Ты чувствуешь, что подзабыл алгебру...";
const aTiCuvstvuesC_1 = "Ты чувствуешь, что анализ придется учить заново.";
const aVGolovuPostoqn = "В голову постоянно лезут мысли о всяких феях...";
const aTiCuvstvuesC_2 = "Ты чувствуешь, что все вокруг жаждут твоей смерти.";
const aKudaToPodevala = "Куда-то подевалась твоя уверенность в себе.";
const aGolovaStalaRab = "Голова стала работать заметно лучше.";
const aTiProniksqLubo = "Ты проникся любовью к окружающему миру.";
const aTiGotovKLubimI = "Ты готов к любым испытаниям.";
const aPokaTvoiGlazaB = "Пока твои глаза были закрыты, кто-то утащил твои деньги!!!";
const aTiNaselVSvoemK = "Ты нашел в своем кармане какие-то деньги!";
const aTiCuvstvuesC_3 = "Ты чувствуешь, что от тебя сильно несет чесноком.";
const aNeZnauVivetrit = "Не знаю, выветрится ли такой сильный запах...";
const aStrannoeCuvstv = "Странное чувство быстро прошло.";


async function english_done() {
    colored_output(7, aVlasenkoN_p_);
    colored_output_ln(0x0F, aZakroiteGlaza_);
    writeln(aTiPoslusnoZakr);
    await Delay(0x3E8);
    colored_output_ln(0x0F, aOktroiteGlaza_);
    random_color_output(aTiVidisVlasenk);
    random_color_output(aVlasenkoN_p_Ka);
    random_color_output(aTiCuvstvuesCto);

    const ax = Random(0x0F);

    if (ax === 0) {
        random_color_output(aTebeSilNoPoplo);
        decrease_health(0x1E, aFeqBilaQvnoNeV);
    } else if (ax === 1) {
        random_color_output(aTiPocuvstvoval);
        current_place = 2;
        current_subject = -1;
    } else if (ax === 2) {
        hero.subject[Algebra].knowledge = idiv(hero.subject[Algebra].knowledge, 2);
        random_color_output(aTiCuvstvuesC_0);
    } else if (ax === 3) {
        hero.subject[Matan].knowledge = idiv(hero.subject[Matan].knowledge, 2);
        random_color_output(aTiCuvstvuesC_1);
    } else if (ax === 4) {
        hero.brain -= Random(2) + 1;
        random_color_output(aVGolovuPostoqn);
    } else if (ax === 5) {
        hero.charizma -= Random(2) + 1;
        random_color_output(aTiCuvstvuesC_2);
    } else if (ax === 6) {
        hero.stamina -= Random(2) + 1;
        random_color_output(aKudaToPodevala);
    } else if (ax === 7) {
        hero.brain += Random(3) + 1;
        random_color_output(aGolovaStalaRab);
    } else if (ax === 8) {
        hero.charizma += Random(3) + 1;
        random_color_output(aTiProniksqLubo);
    } else if (ax === 9) {
        hero.stamina += Random(3) + 1;
        random_color_output(aTiGotovKLubimI);
    } else if (ax === 0xA) {
        if (hero.money > 0) {
            hero.money = 0;
            random_color_output(aPokaTvoiGlazaB);
        } else {
            hero.money = 0x14;
            random_color_output(aTiNaselVSvoemK);
        }
    } else if (ax === 0xB || ax === 0xC || ax === 0xD) {
        random_color_output(aTiCuvstvuesC_3);
        random_color_output(aNeZnauVivetrit);
        hero.garlic = Random(4) + 1;
        hero.charizma -= idiv(hero.garlic, 2);
    } else if (ax === 0xE) {
        random_color_output(aStrannoeCuvstv);
    }

    await wait_for_key();
    ClrScr();
    show_header_stats();

} // end function 183A0


async function exam_done(subject) {
    if (subject === English) {
        await english_done();
    } else if (subject === Algebra) {
        await algebra_done();
    } else {
        await common_exam_done();
    }
} // end function 185C9


const aMucaesSq____0 = "Мучаешься ...";
const aPodkoritov = "Подкорытов:";
const aCegoToQNePonim = "\"Чего-то я не понимаю... Похоже, Вы меня лечите...\"";
const aTvoiMuceniqB_0 = "Твои мучения были напрасны.";
const aTebeZacliEse_0 = "Тебе зачли еще ";
const aZamucil_0 = " замучил";
const aA_0 = "а";
const a__0 = ".";


async function continue_exam() {
    GotoXY(1, 0x14);
    TextColor(0x0D);
    writeln(aMucaesSq____0);
    TextColor(7);
    writeln();

    let task_done = hero.subject[current_subject].knowledge - subjects[current_subject].member0xFA + Random(hero.brain);
    if (hero.health <= 5) {
        task_done -= Random(5 - hero.health);
    }

    if (task_done > 0) {
        task_done = Round(Sqrt(task_done) / subjects[current_subject].member0x100);
    } else {
        task_done = 0;
    }

    if (hero.subject[current_subject].tasks_done + task_done > subjects[current_subject].tasks) {
        task_done = subjects[current_subject].tasks - hero.subject[current_subject].tasks_done;
    }

    const knowledge_drop = Math.min(Random(hero.stamina) - Random(subjects[current_subject].member0xFA), 0);

    hero.subject[current_subject].knowledge += knowledge_drop;
    if (hero.subject[current_subject].knowledge < 0) {
        hero.subject[current_subject].knowledge = 0;
    }

    if (current_subject === GiT && (hero.charizma * 2 + 0x1A < hero.subject[current_subject].knowledge)) {
        GotoXY(1, 0x14);
        TextColor(7);
        write(aPodkoritov);
        TextColor(0x0F);
        writeln(aCegoToQNePonim);
        task_done = 0;
    }

    GotoXY(1, 0x15);
    if (task_done === 0) {
        colored_output(0x0C, aTvoiMuceniqB_0);
    } else {
        colored_output(0x0A, aTebeZacliEse_0);
        colored_output_white(task_done);
        TextColor(0x0A);
        zadanie_in_case(task_done);
        write("!");
        TextColor(7);
    }


    hero.subject[current_subject].tasks_done += task_done;
    const health_drop = Math.min(Random(hero.stamina) - subjects[current_subject].member0xFC, 0);

    hero.health += health_drop;
    if (hero.health <= 0) {
        is_end = true;
        death_cause = subjects[current_subject].professor.name + aZamucil_0;
        if (subjects[current_subject].professor.sex === Female) {
            death_cause += aA_0;
        }
        death_cause += a__0;
    }

    await hour_pass();
    await wait_for_key();

} // end function 18677


const aUVasVseZacteno = "У вас все зачтено, можете быть свободны.";
const aSeicasTebqIstq = "Сейчас тебя истязает ";
const aKromeTebqZdesE = "Кроме тебя, здесь еще сид";
const aIt = "ит ";
const aQt = "ят ";
const aI = " и ";
const asc_18A07 = ", ";
const aUTebqEseNicego = "У тебя еще ничего не зачтено.";
const aZacteno = "Зачтено ";
const aZadacIz = " задач из ";
const aUTebqUjeVseZac = "У тебя уже все зачтено.";
const aMucatSqDalSe = "Мучаться дальше";
const aBrositAtoDelo = "Бросить это дело";


async function scene_exam() {
    // let var_15;
    let var_14;
    const var_12 = [];
    let classmates_bitset = 0;

    last_subject = current_subject;

    // var_15 = 0;
    for (let var_2 = 0; var_2 <= 0xB; ++var_2) {
        // #warning
        //[bp+var_2+var_12] = 0;
        var_12.push(0);
    }
    var_14 = 0;


    if (current_subject === -1) {
        return;
    }

    if (hero.health <= 0 || is_end) {
        return;
    }

    ClrScr();
    show_header_stats();

    if (hero.subject[current_subject].tasks_done >= subjects[current_subject].tasks) {

        writeln();
        TextColor(0x0A);
        writeln(aUVasVseZacteno);
        TextColor(7);

        if (!hero.subject[current_subject].passed) {
            hero.subject[current_subject].pass_day = day_of_week;
            hero.subject[current_subject].passed = true;
            --hero.exams_left;

            writeln();
            await exam_done(current_subject);

            if (current_subject === -1) {
                console.log("Error in exam");
                return;
            }

            if (is_end) {
                return;
            }
        }

    }


    if (timesheet[day_of_week][current_subject].to <= time_of_day) {
        await exam_ends(current_subject);
        return;
    }

    GotoXY(1, 8);
    TextColor(0x0E);
    write(aSeicasTebqIstq);
    write(subjects[current_subject].professor.name);
    writeln(".");

    let classmates_count = 0;
    for (let i = 0; i <= 0xB; ++i) {
        if (jz(classmates[i].current_subject, current_subject) || current_place === Kompy) {
            if (classmates[i].place === current_place) {
                if (i < 0x10) {
                    classmates_bitset |= 1 << i;
                }
                ++classmates_count;
            }
        }
    }


    if (classmates_count > 0) {

        TextColor(7);
        write(aKromeTebqZdesE);

        if (classmates_count === 1) {
            write(aIt);
        } else if (classmates_count > 1) {
            write(aQt);
        }

        for (let i = Kolya; i <= Grisha; ++i) {
            if (classmates_bitset & (1 << i)) {
                write(classmate_names[i]);

                --classmates_count;

                if (classmates_count === 0) {
                    writeln(".");
                } else if (classmates_count === 1) {
                    write(aI);
                } else {
                    write(asc_18A07);
                }
                if (WhereX() > 70) {
                    writeln();
                }
            }
        }
    }

    // var_15 = 1;
    do {

        if (!jg(idiv(hero.charizma, 2), var_14)) {
            break;
        }

        if (!jle(var_14, 3)) {
            break;
        }

        for (let var_2 = 0; var_2 <= 0xB; ++var_2) {

            if (jz(var_12[var_2], 0)) {

                if (classmates[var_2].bothers_activity - idiv(var_14, 2) - hero.garlic > Random(0x0A)) {

                    if (var_2 < 0x10) {

                        if (classmates_bitset & (1 << var_2)) {

                            if (!jle(idiv(hero.charizma, 2), var_14)) {

                                var_12[var_2] = 1;

                                ++var_14;
                                await bothers(var_2);

                                if (!jg(timesheet[day_of_week][current_subject].to, time_of_day)) {
                                    await exam_ends(current_subject);
                                    return;
                                } else {
                                    await check_exams_left_count();
                                    if (is_end) {
                                        return;
                                    } else {
                                        ClrScr();
                                        show_header_stats();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    } while (Random(2) === 0);


    GotoXY(1, 7);

    if (hero.subject[current_subject].tasks_done === 0) {
        colored_output_ln(7, aUTebqEseNicego);
    } else {
        if (hero.subject[current_subject].tasks_done < subjects[current_subject].tasks) {
            colored_output(7, aZacteno);
            colored_output_white(hero.subject[current_subject].tasks_done);
            colored_output(7, aZadacIz);
            colored_output_white(subjects[current_subject].tasks);
            writeln();
        } else {
            colored_output_ln(0x0A, aUTebqUjeVseZac);
        }
    }

    dialog_start();
    if (!hero.subject[current_subject].passed) {
        dialog_case(aMucatSqDalSe, -1);
    }

    for (let i = 0; i <= 0xB; ++i) {
        if (classmates_bitset & (1 << i)) {
            dialog_case_colored(classmate_names[i], i, 0xE);
        }
    }

    dialog_case(aBrositAtoDelo, -2);
    show_short_today_timesheet(0x0C);
    const ax = await dialog_run(1, 0x0C);
    if (ax === -1) {
        await continue_exam();
    } else if (ax === -2) {
        current_subject = NoSubj;
    } else if (ax >= 0 && ax <= 0xB) {
        await talk_with_classmate(ax);
    }

} // end function 18A75


const aKTebePristaet = "К тебе пристает ";
const a_CtoBudesDelat = ". Что будешь делать?";
const aPitatSqIgnorir = "Пытаться игнорировать";
const aTebeKakToNexor = "Тебе как-то нехорошо ...";
const aLucseIgnorirov = " лучше игнорировать не надо.";


async function bothers(student) {
    // var var_104;
    let var_4;
    let var_1;

    if (student !== Rai || current_place !== Kompy) {

        writeln();
        write(aKTebePristaet);
        write(classmate_names[student]);

        writeln(a_CtoBudesDelat);

        dialog_start();
        dialog_case(aPitatSqIgnorir, -1);
        dialog_case(classmate_names[student], -2);

        var_4 = WhereY() + 2;
        show_short_today_timesheet(var_4);
        const res = await dialog_run(1, var_4);

        if (res === -1) {
            if (classmates[student].bothers_penalty > 0) {
                GotoXY(1, 0x16);
                writeln(aTebeKakToNexor);
                decrease_health(classmates[student].bothers_penalty, classmate_names[student] + aLucseIgnorirov);
            }

            var_1 = 0;
            await wait_for_key();
            ClrScr();
        } else if (res === -2) {
            var_1 = 1;
            await talk_with_classmate(student);
        }

    }

    return var_1;
} // end function 18FB2


async function kolya_talk() {
    const aKolqSmotritNaT = "Коля смотрит на тебя немного окосевшими глазами.";
    const aUTebqOstalisNe = "\"У тебя остались нерешенные задачи по Всемирнову? Давай сюда!\"";
    const aKolqResilTebeE = "Коля решил тебе еще ";
    const aZadaciPoAlgebr = " задачи по алгебре!";
    const aZnaesPivoKonec = "\"Знаешь, пиво, конечно, хорошо, но настойка овса - лучше!\"";
    const aZakazatKoleNas = "Заказать Коле настойку овса?";
    const aDa = "Да";
    const aNet = "Нет";
    const aTvoiAlTruizmNa = "Твой альтруизм навсегда останется в памяти потомков.";
    const aZrqOiZrq___ = "\"Зря, ой, зря ...\"";
    const aKolqDostaetTor = "Коля достает тормозную жидкость, и вы распиваете еще по стакану.";
    const aSpilsq_ = "Спился.";


    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    writeln(aKolqSmotritNaT);

    if (hero.charizma > Random(0x0A) && subjects[Algebra].tasks - 2 >= hero.subject[Algebra].tasks_done) {
        current_color = 0x0F;
        writeln(aUTebqOstalisNe);
        hero.subject[Algebra].tasks_done += 2;
        output_with_highlighted_num(7, aKolqResilTebeE, 0x0F, 2, aZadaciPoAlgebr);
        await wait_for_key();
        ClrScr();
        await hour_pass();
        return;
    }

    current_color = 0x0F;
    writeln(aZnaesPivoKonec);

    if (hero.money <= 0x0F) {

        GotoXY(1, 0x0F);
        current_color = 0x0D;
        writeln(aKolqDostaetTor);
        --hero.brain;
        check_brain_dead(aSpilsq_);

    } else {

        current_color = 7;
        writeln(aZakazatKoleNas);
        dialog_start();
        dialog_case(aDa, -1);
        dialog_case(aNet, -2);
        show_short_today_timesheet(0x0C);
        const res = await dialog_run(1, 0x0F);

        if (res === -1) {

            hero.money -= 0xF;
            GotoXY(1, 0x13);

            if (hero.charizma > Random(0x0A) && hero.subject[Algebra].tasks_done + 1 < subjects[Algebra].tasks) {
                current_color = 0x0F;
                writeln(aUTebqOstalisNe);
                hero.subject[Algebra].tasks_done += 2;
                output_with_highlighted_num(7, aKolqResilTebeE, 0x0F, 2, aZadaciPoAlgebr);
                await wait_for_key();
                ClrScr();
                await hour_pass();
                return;
            } else {
                current_color = 7;
                writeln(aTvoiAlTruizmNa);
            }

        } else if (res === -2) {
            GotoXY(1, 0x13);
            current_color = 0x0F;
            writeln(aZrqOiZrq___);
            current_color = 0x0D;
            writeln(aKolqDostaetTor);
            --hero.brain;
            await wait_for_key();
            ClrScr();
            return;
        }

    }

    await wait_for_key();
    ClrScr();
} // end function 19259


const aWowTiTolKoCtoV = "Wow! Ты только что встретил автора !";
const aDiamond_0 = "Diamond:";
const aKolqPomojetSAl = "\"Коля поможет с алгеброй.\"";
const aMisaRasskajetV = "\"Миша расскажет всем, какой ты хороший.\"";
const aPasaTvoiStaros = "\"Паша - твой староста.\"";
const aSDjugomLucseNe = "\"С DJuGом лучше не сталкиваться.\"";
const aRaiNeOtstanetL = "\"RAI не отстанет, лучше решить ему чего-нибудь.\"";
const aKolqVseVremqSi = "\"Коля все время сидит в мавзолее и оттягивается.\"";
const aSlediZaSvoimZd = "\"Следи за своим здоровьем!!!\"";
const aEsliVstretisSa = "\"Если встретишь Сашу - ОБЯЗАТЕЛЬНО заговори с ним.\"";
const aEsliPloxoDumae = "\"Если плохо думается, попробуй поговорить с RAI.\"";
const aIdqKKoleBudUve = "\"Идя к Коле, будь уверен, что можешь пить с ним.\"";
const aPolucaqZacetPo = "\"Получая зачет по английскому, будь готов к неожиданностям.\"";
const aInogdaRazgovor = "\"Иногда разговоры с Сержем приносят ощутимую пользу.\"";
const aAndruMojetPomo = "\"Эндрю может помочь, но не всегда...\"";
const aKuzMenkoInogda = "\"Кузьменко иногда знает о Климове больше, чем сам Климов.\"";
const aNeSpesiSlatGne = "\"Не спеши слать гневные письма о багах:";
const aZaglqniNaMmher = "загляни на mmheroes.chat.ru,";
const aMojetBitVseUje = "может быть, все уже в порядке!\"";
const aSerjTojeInogda = "\"Серж тоже иногда забегает в мавзолей.\"";
const aNePereuciTopol = "\"Не переучи топологию, а то Подкорытов-младший не поймет.\"";
const aMojesUstroitSq = "\"Можешь устроиться в ТЕРКОМ по знакомству.\"";
const aGrisaRabotaetV = "\"Гриша работает ( ;*) ) в ТЕРКОМе.\"";
const aVTerkomeMojnoZ = "\"В ТЕРКОМЕ можно заработать какие-то деньги.\"";
const aGrisaInogdaBiv = "\"Гриша иногда бывает в Мавзолее.\"";
const aNeNravitsqRasp = "\"Не нравится расписание? Подумай о чем-нибудь парадоксальном.\"";
const aNilDaetDenGiZa = "\"NiL дает деньги за помощь, но...\"";
const aCestnoNeZnauKo = "\"Честно, не знаю, когда будет готов порт под Linux...\"";
const aSrocnoNujniNov = "\"Срочно! Нужны новые фишки для \"Зачетной недели\" !\"";
const aPojelaniqIdeiB = "\"Пожелания, идеи, bug report'ы шлите на mmheroes@chat.ru !\"";
const aVstretisKostuB = "\"Встретишь Костю Буленкова - передай ему большой привет!\"";
const aBolSoeSpasiboV = "\"Большое спасибо Ване Павлику за mmheroes.chat.ru !\"";
const aDiamondUbegaet = "Diamond убегает по своим делам ...";
const aXocesPoTestitN = "\"Хочешь по-тестить новую версию Heroes of MAT-MEX?\"";
const aDaKonecnoOcenX = "ДА, КОНЕЧНО, ОЧЕНЬ ХОЧУ!";
const aNetUMenqNetNaA = "Нет, у меня нет на это времени...";
const aNuILaduskiVotT = "\"Ну и ладушки! Вот тебе дискетка...\"";
const aIzviniCtoPobes = "\"Извини, что побеспокоил.\"";


async function diamond_dialog() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    current_color = 0x0E;
    writeln(aWowTiTolKoCtoV);
    writeln();
    write(aDiamond_0);

    if (hero.has_mmheroes_disk && current_place === Kompy && Random(8) === 0) {
        writeln(aXocesPoTestitN);
        dialog_start();
        dialog_case(aDaKonecnoOcenX, -1);
        dialog_case(aNetUMenqNetNaA, -2);
        show_short_today_timesheet(0x0C);
        const res = await dialog_run(1, 0x0C);
        if (res === -1) {
            GotoXY(1, 0x10);
            writeln(aNuILaduskiVotT);
            hero.has_mmheroes_disk = true;
            await wait_for_key();
        } else if (res === -2) {
            GotoXY(1, 0x10);
            writeln(aIzviniCtoPobes);
            await wait_for_key();
        }
        return;
    }

    current_color = 0x0F;
    const phrases = [
        aKolqPomojetSAl, aMisaRasskajetV, aPasaTvoiStaros, aSDjugomLucseNe, aRaiNeOtstanetL,
        aKolqVseVremqSi, aSlediZaSvoimZd, aEsliVstretisSa, aEsliPloxoDumae, aIdqKKoleBudUve,
        aPolucaqZacetPo, aInogdaRazgovor, aAndruMojetPomo, aKuzMenkoInogda,
        aNeSpesiSlatGne + "\n" + aZaglqniNaMmher + "\n" + aMojetBitVseUje,
        aSerjTojeInogda, aNePereuciTopol, aMojesUstroitSq, aGrisaRabotaetV, aVTerkomeMojnoZ,
        aGrisaInogdaBiv, aNeNravitsqRasp, aNilDaetDenGiZa, aCestnoNeZnauKo, aSrocnoNujniNov,
        aPojelaniqIdeiB, aVstretisKostuB, aBolSoeSpasiboV];
    writeln(RandomPhrase(phrases));
    current_color = 7;

    if (current_subject === -1) {
        if (Random(2) === 0) {
            writeln(aDiamondUbegaet);
            classmates[Diamond].place = Nowhere;
            classmates[Diamond].current_subject = -1;
        }
    }

    await wait_for_key();
} // end function 19B20


async function rai_talk() {
    const aRai_0 = "RAI:";
    const aTiMnePomojes = "\"Ты мне поможешь?\"";
    const aDaKonecno = "\"Да, конечно\"";
    const aNetIzvini___ = "\"Нет, извини...\"";
    const aTiPomogRai_ = "Ты помог RAI.";
    const aNicegoNeVislo_ = "Ничего не вышло.";
    const aAxTakPolucaiPo = "\"Ах, так! Получай! Получай!\"";
    const aRaiDelaetTebeB = "RAI делает тебе больно ...";
    const aRaiZamocil_ = "RAI замочил.";
    const aRaiNeReagiruet = "RAI не реагирует на твои позывы.";

    if (current_subject >= 3 || current_subject === -1) {
        ClrScr();
        show_header_stats();
        GotoXY(1, 8);
        writeln(aRaiNeReagiruet);
    } else {

        ClrScr();
        show_header_stats();
        TextColor(7);
        GotoXY(1, 0x0A);
        write(aRai_0);
        TextColor(0x0F);
        write(aTiMnePomojes);
        dialog_start();
        dialog_case(aDaKonecno, 1);
        dialog_case(aNetIzvini___, 2);
        show_short_today_timesheet(0x0C);
        const ax = await dialog_run(1, 0x0C);

        if (ax === 1) {
            GotoXY(1, 0x0F);

            if (Random(hero.subject[current_subject].knowledge) > Random(subjects[current_subject].member0xFA)) {
                TextColor(0x0A);
                writeln(aTiPomogRai_);
                ++hero.brain;
                TextColor(7);
            } else {
                writeln(aNicegoNeVislo_);
            }
            await hour_pass();
        } else if (ax === 2) {
            GotoXY(1, 0x0F);
            TextColor(0x0D);
            writeln(aAxTakPolucaiPo);
            TextColor(7);
            writeln(aRaiDelaetTebeB);
            decrease_health(0x0A, aRaiZamocil_);
        }

    }

    await wait_for_key();
    ClrScr();
} // end function 1A0A2


async function misha_talk() {
    const aMisa_0 = "Миша : ";
    const aSlusaiXvatitMu = "\"Слушай, хватит мучаться! Прервись!";
    const aDavaiVKlopodav = "Давай в клоподавку сыграем!\"";
    const aDavai = "\"Давай!\"";
    const aNetNeBuduQVKlo = "\"Нет, не буду я в клоподавку ...\"";
    const aTiSigralSMisei = "Ты сыграл с Мишей партию в клоподавку.";
    const aZrqOcenZrq = "\"Зря, очень зря!\"";
    const aSlusaiAVedVTer = "\"Слушай, а ведь в ТЕРКОМе есть столик для тенниса. Сыграем?\"";
    const aObqzatelNo = "\"Обязательно!\"";
    const aIzviniPotom_ = "\"Извини, потом.\"";
    const aTiSigralSMis_0 = "Ты сыграл с Мишей в теннис.";
    const aZagonqlTebqMis = "Загонял тебя Миша.";
    const aNicegoQNaTebqN = "\"Ничего, я на тебя не в обиде.\"";
    const aMisa_1 = "Миша:";
    const aAxJalNegdeSigr = "\"Эх, жаль, негде сыграть в клоподавку!\"";
    const aVsegdaSlediZaZ = "\"Всегда следи за здоровьем!\"";
    const aMozgiVliqutNaP = "\"Мозги влияют на подготовку и сдачу зачетов.\"";
    const aCemBolSeVinosl = "\"Чем больше выносливость, тем меньше здоровья ты тратишь.\"";
    const aCemBolSeTvoqXa = "\"Чем больше твоя харизма, тем лучше у тебя отношения с людьми.\"";
    const aVajnostKonkret = "\"Важность конкретного качества сильно зависит от стиля игры.\"";
    const aXarizmaPomogae = "\"Харизма помогает получить что угодно от кого угодно.\"";
    const aCemBolSeXarizm = "\"Чем больше харизма, тем чаще к тебе пристают.\"";
    const aCemMenSeVinosl = "\"Чем меньше выносливость, тем больнее учиться.\"";
    const aCemBolSeMozgiT = "\"Чем больше мозги, тем легче готовиться.\"";
    const aSidenieVInetEI = "\"Сидение в Inet'e иногда развивает мозги.\"";
    const aEsliTebeNadoel = "\"Если тебе надоело умирать - попробуй другую стратегию.\"";
    const aXocesXalqviNab = "\"Хочешь халявы - набирай харизму.\"";
    const aXocesDobitSqVs = "\"Хочешь добиться всего сам - развивай мозги.\"";
    const aVMavzoleeVajno = "\"В \"Мавзолее\" важно знать меру...\"";
    const aOtRazdvoeniqLi = "\"От раздвоения личности спасают харизма и выносливость.\"";
    const aOtLubogoObseni = "\"От любого общения с NiL ты тупеешь!\"";
    const aGrisaMojetPomo = "\"Гриша может помочь с трудоустройством.\"";
    const aPeremeseniqStu = "\"Перемещения студентов предсказуемы.\"";

    ClrScr();
    show_header_stats();

    if (current_place !== Kompy && current_subject !== -1) {

        GotoXY(1, 8);
        TextColor(7);
        write(aMisa_0);
        TextColor(0x0F);
        writeln(aSlusaiXvatitMu);
        writeln(aDavaiVKlopodav);
        dialog_start();
        dialog_case(aDavai, 1);
        dialog_case(aNetNeBuduQVKlo, 2);
        const res = await dialog_run(1, 0x0C);

        if (res === 1) {
            GotoXY(1, 0x0F);
            TextColor(0x0A);
            writeln(aTiSigralSMisei);
            TextColor(7);
            ++hero.charizma;
            await wait_for_key();
            ClrScr();
            await hour_pass();
        } else if (res === 2) {
            GotoXY(1, 0x0F);
            TextColor(0x0F);
            writeln(aZrqOcenZrq);
            hero.charizma -= Random(2);
            await wait_for_key();
            TextColor(7);
            ClrScr();
        }
        return;

    }


    if (current_place === Punk && current_subject === -1 && hero.is_working_in_terkom) {

        if (hero.charizma > Random(8)) {

            GotoXY(1, 8);
            TextColor(7);
            write(aMisa_0);
            TextColor(0x0F);
            writeln(aSlusaiAVedVTer);
            dialog_start();
            dialog_case(aObqzatelNo, 1);
            dialog_case(aIzviniPotom_, 2);
            const res = await dialog_run(1, 0x0C);

            if (res === 1) {
                GotoXY(1, 0x0F);
                TextColor(0x0A);
                writeln(aTiSigralSMis_0);
                TextColor(7);
                ++hero.charizma;

                if (hero.charizma < Random(0x0A)) {
                    decrease_health(Random(3) + 3, aZagonqlTebqMis);
                } else {
                    await wait_for_key();
                    ClrScr();
                    await hour_pass();
                }

            } else if (res === 2) {
                GotoXY(1, 0x0F);
                TextColor(0x0F);
                writeln(aNicegoQNaTebqN);
                await wait_for_key();
                TextColor(7);
                ClrScr();
            }

            return;
        }
    }


    GotoXY(1, 8);
    TextColor(7);
    write(aMisa_1);
    TextColor(0x0F);
    const phrases = [
        aAxJalNegdeSigr, aVsegdaSlediZaZ, aMozgiVliqutNaP, aCemBolSeVinosl, aCemBolSeTvoqXa, aVajnostKonkret,
        aXarizmaPomogae, aCemBolSeXarizm, aCemMenSeVinosl, aCemBolSeMozgiT, aSidenieVInetEI, aEsliTebeNadoel,
        aXocesXalqviNab, aXocesDobitSqVs, aVMavzoleeVajno, aOtRazdvoeniqLi, aOtLubogoObseni, aGrisaMojetPomo,
        aPeremeseniqStu
    ];
    write(RandomPhrase(phrases));

    await wait_for_key();
    ClrScr();

} // end function 1A70A


async function serg_talk() {
    const aSerj_0 = "Серж: ";
    const aNaGlotniKefirc = "\"На, глотни кефирчику.\"";
    const aQZnauGdeSrezat = "\"Я знаю, где срезать в парке на физ-ре!\"";
    const aPomnitsqKogdaT = "\"Помнится, когда-то была еще графическая версия mmHeroes...\"";
    const aQBilBetaTester = "\"Я был бета-тестером первой версии mmHeroes (тогда еще CRWMM19)!\"";
    const aKakZdorovoCtoD = "\"Как здорово, что Diamond написал новую версию!\"";
    const aTiUjePolucilDe = "\"Ты уже получил деньги у Паши?\"";
    const aPoprobuiDlqNac = "\"Попробуй для начала легкие зачеты.\"";
    const aTiEseNePolucil = "\"Ты еще не получил зачет по английскому?\"";
    const aXocesOtdixatGd = "\"Хочешь отдыхать, где угодно? Заимей деньги!\"";
    const aNeVDenGaxScast = "\"Не в деньгах счастье. Но они действуют успокаивающе.\"";
    const aNaVsemirnoveVs = "\"На Всемирнове всегда толпа народу.\"";
    const aVlasenkoDamaVe = "\"Влащенко - дама весьма оригинальная.\"";
    const aInteresnoKogda = "\"Интересно, когда будет готова следующая версия?\"";
    const aZdorovEVKafePo = "\"Здоровье в кафе повышается в зависимости от наличия денег.\"";
    const aEsliBiQZnalAdr = "\"Если бы я знал адрес хорошего proxy...\"";
    const aStarVremennoNa = "\"STAR временно накрылся. Хорошо бы узнать адрес другого proxy...\"";
    const aQPodozrevauCto = "\"Я подозреваю, что Гриша знает адресок теркомовского proxy.\"";
    const aADiamondVseSvo = "\"А Diamond все свободное время дописывает свою игрушку!\"";
    const aVSleduusemSeme = "\"В следующем семестре информатику будет вести Терехов-младший.\"";
    const aDiamondXocetPe = "\"Diamond хочет переписать это все на Java.\"";
    const aMisaProkonsulT = "\"Миша проконсультирует тебя о стратегии.\"";
    const aPogovoriSDiamo = "\"Поговори с Diamond'ом, он много ценного скажет.\"";
    const aBorisDoKonca = "\"Борись до конца!\"";
    const aUDubcovaInogda = "\"У Дубцова иногда бывает халява.\"";
    const aSerjUxoditKuda = "Серж уходит куда-то по своим делам ...";

    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    TextColor(7);
    write(aSerj_0);
    TextColor(0x0F);

    if (Random(hero.charizma) > Random(3) + 2 && hero.charizma * 2 + 20 > hero.health) {

        writeln(aNaGlotniKefirc);
        hero.health += hero.charizma + Random(hero.charizma);

        if (current_subject !== NoSubj) {
            if (hero.subject[current_subject].knowledge > 3) {
                hero.subject[current_subject].knowledge -= Random(3);
            }
        }

    } else {

        if (Random(hero.charizma) > Random(6) + 2 && hero.subject[Fizra].knowledge < 0x0A) {
            writeln(aQZnauGdeSrezat);
            hero.subject[Fizra].knowledge += 0x1E;
        } else {
            const phrases = [
                aPomnitsqKogdaT, aQBilBetaTester, aKakZdorovoCtoD, aTiUjePolucilDe, aPoprobuiDlqNac,
                aTiEseNePolucil, aXocesOtdixatGd, aNeVDenGaxScast, aNaVsemirnoveVs, aVlasenkoDamaVe,
                aInteresnoKogda, aZdorovEVKafePo, aEsliBiQZnalAdr, aStarVremennoNa, aQPodozrevauCto,
                aADiamondVseSvo, aVSleduusemSeme, aDiamondXocetPe, aMisaProkonsulT, aPogovoriSDiamo,
                aBorisDoKonca, aUDubcovaInogda
            ];
            writeln(RandomPhrase(phrases));
        }

    }

    if (hero.charizma < Random(9)) {
        TextColor(7);
        writeln(aSerjUxoditKuda);
        classmates[Serzg].current_subject = NoSubj;
        if (classmates[Serzg].place === Mavzoley) {
            classmates[Serzg].place = Nowhere;
        } else {
            classmates[Serzg].place = Mavzoley;
        }
    }

    await wait_for_key();
    TextColor(7);
    ClrScr();
} // end function 1B09A


async function pawa_talk() {
    const aPasaVrucaetTeb = "Паша вручает тебе твою стипуху за май: ";
    const aRub__2 = " руб.";
    const aPasaVoodusevlq = "Паша воодушевляет тебя на великие дела.";
    const aVmesteSAtimOnN = "Вместе с этим он немного достает тебя.";


    ClrScr();
    show_header_stats();

    if (!hero.got_stipend) {
        hero.got_stipend = true;
        GotoXY(1, 8);
        output_with_highlighted_num(7, aPasaVrucaetTeb, 0x0F, 0x32, aRub__2);
        hero.money += 50;
    } else {

        GotoXY(1, 8);
        TextColor(0x0A);
        writeln(aPasaVoodusevlq);
        TextColor(0x0C);
        writeln(aVmesteSAtimOnN);
        ++hero.stamina;

        for (let subj = 0; subj <= 5; ++subj) {
            if (hero.subject[subj].knowledge > 3) {
                hero.subject[subj].knowledge -= Random(3);
            }
        }

    }

    await wait_for_key();
    ClrScr();

} // end function 1B526


async function sasha_talk() {
    const aTiVstretilSasu = "Ты встретил Сашу! Говорят, у него классные конспекты ...";
    const aNicegoNeNado = "Ничего не надо";
    const aCegoTebeNadoOt = "Чего тебе надо от Саши?";
    const aKakZnaes___ = "Как знаешь...";
    const aSasa_1 = "Саша:";
    const aDaUMenqSSoboiA = "\"Да, у меня с собой этот конспект ...\"";
    const aOxIzviniKtoToD = "\"Ох, извини, кто-то другой уже позаимствовал ...\"";

    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    TextColor(0x0E);
    writeln(aTiVstretilSasu);
    GotoXY(1, 9);
    writeln(aCegoTebeNadoOt);

    dialog_start();
    for (let subj = 0; subj <= 2; ++subj) {
        if (!synopsis[subj].hero_has) {
            dialog_case(subjects[subj].title, subj);
        }
    }

    dialog_case(aNicegoNeNado, -1);
    const res = await dialog_run(1, 0x0B);

    if (res === -1) {
        GotoXY(1, 0x0F);
        writeln(aKakZnaes___);
    } else {
        if (hero.charizma > Random(0x12) && synopsis[res].sasha_has) {
            GotoXY(1, 0x0F);
            TextColor(7);
            write(aSasa_1);
            TextColor(0x0F);
            writeln(aDaUMenqSSoboiA);
            synopsis[res].hero_has = true;
            // byte_2549F = 0;
        } else {
            GotoXY(1, 0x0F);
            TextColor(7);
            write(aSasa_1);
            TextColor(0x0F);
            writeln(aOxIzviniKtoToD);
            synopsis[res].sasha_has = false;
        }
    }

    await wait_for_key();
    ClrScr();
} // end function 1B6B7


const aMaladoiCilavek = "\"Маладой чилавек, вы мне не паможите решить задачу?";
const aAToQSigodnqNiV = "А то я сигодня ни в зуб нагой ...\"";
const aDaKonecno_0 = "\"Да, конечно\"";
const aIzviniVDrugoiR = "\"Извини, в другой раз\"";
const aOiSpasiboVotVa = "\"Ой, спасибо! Вот вам ";
const aRub_ZaAto___ = " руб. за это...\"";
const aAlTruizmNeDove = "Альтруизм не довел до добра.";
const aUTebqNicegoNeV = "У тебя ничего не вышло.";
const aTiZavodisSNilS = "Ты заводишь с NiL светскую беседу.";
const aTebePoploxelo_ = "Тебе поплохело.";
const aObsenieSNilOka = "Общение с NiL оказалось выше человеческих сил.";


async function nil_talk() {
    ClrScr();
    show_header_stats();

    if (current_subject === -1) {

        GotoXY(1, 8);
        TextColor(7);
        writeln(aTiZavodisSNilS);
        TextColor(0x0D);
        writeln(aTebePoploxelo_);
        decrease_health(0x0A, aObsenieSNilOka);

    } else {

        GotoXY(1, 8);
        TextColor(0x0B);
        writeln(aMaladoiCilavek);
        writeln(aAToQSigodnqNiV);
        dialog_start();
        dialog_case(aDaKonecno_0, -1);
        dialog_case(aIzviniVDrugoiR, -2);
        const ax = await dialog_run(1, 0x0B);

        if (ax === -1) {

            if (jg(hero.subject[current_subject].knowledge, subjects[current_subject].member0xFA)) {

                GotoXY(1, 0x0E);
                TextColor(0x0E);
                write(aOiSpasiboVotVa);
                write(hero.subject[current_subject].knowledge);
                writeln(aRub_ZaAto___);

                hero.money += hero.subject[current_subject].knowledge;
                const knowledge = subjects[current_subject].member0x100 + Random(subjects[current_subject].member0xFC);
                hero.subject[current_subject].knowledge -= knowledge;

                decrease_health(subjects[current_subject].member0xFC, aAlTruizmNeDove);
                await hour_pass();

            } else {

                GotoXY(1, 0x0E);
                TextColor(0x0D);
                writeln(aUTebqNicegoNeV);
                decrease_health(subjects[current_subject].member0xFC, aAlTruizmNeDove);
                await hour_pass();
            }

        } else if (ax === -2) {
            hero.brain -= Random(2);
            hero.charizma -= Random(2);
            hero.stamina -= Random(2);
        }

    }

    await wait_for_key();
    TextColor(7);
    ClrScr();
} // end function 1B986


function kuzmenko_speech() {
    const aKuzMenko = "Кузьменко:";
    const a___Otformatiro = "\"... отформатировать дискету так, чтобы 1ый сектор был 5ым ...\"";
    const aAViNigdeNeVide = "\"А Вы нигде не видели литературы по фильтрам в Windows?\"";
    const a___NapisatVizu = "\"... написать визуализацию байта на ассемблере за 11 байт ...\"";
    const aUVasOlegPlissV = "\"У вас Олег Плисс ведет какие-нибудь занятия?\"";
    const aBillGatesMustD = "\"Bill Gates = must die = кабысдох (рус.).\"";
    const aViCitaliJurnal = "\"Вы читали журнал \"Монитор\"? Хотя вряд ли...\"";
    const aQSlisalCtoMmhe = "\"Я слышал, что mmHeroes написана на BP 7.0.\"";
    const aZapisivaitesNa = "\"Записывайтесь на мой семинар по языку Си!\"";
    const aNaTretEmKurseQ = "\"На третьем курсе я буду вести у вас спецвычпрактикум.\"";
    const aInteresnoKog_0 = "\"Интересно, когда они снова наладят STAR?\"";
    const aPoluciteSebeQs = "\"Получите себе ящик rambler'e или на mail.ru !\"";
    const aARazveTerexovS = "\"А разве Терехов-старший ничего не рассказывает про IBM PC?\"";

    GotoXY(1, 8);
    TextColor(7);
    write(aKuzMenko);
    TextColor(0x0F);
    const phrases = [
        a___Otformatiro, aAViNigdeNeVide, a___NapisatVizu, aUVasOlegPlissV, aBillGatesMustD, aViCitaliJurnal,
        aQSlisalCtoMmhe, aZapisivaitesNa, aNaTretEmKurseQ, aInteresnoKog_0, aPoluciteSebeQs, aARazveTerexovS];
    const phrase = RandomPhrase(phrases);
    writeln(phrase);
} // end function 1BE39


const aKuzMenko_0 = "Кузьменко:";
const aViZnaeteKlimov = "\"Вы знаете, Климова можно найти в компьютерном классе";
const aGoMaqS = "-го мая с ";
const aPo = " по ";
const aC__ = "ч..\"";


async function kuzmenko_talk() {
    ClrScr();
    show_header_stats();
    let new_day = 0;
    let is_set = false;
    if (klimov_timesheet_was_modified < 2) {
        const tomorrow = day_of_week + 1;
        for (let day = 5; day >= tomorrow; --day) {
            if (hero.charizma > Random(0x12)) {
                if (timesheet[day][Infa].where === 0) {
                    if (!is_set) {
                        is_set = true;
                        new_day = day;
                        timesheet[new_day][Infa].where = 3;
                        timesheet[new_day][Infa].from = Random(5) + 0xA;
                        timesheet[new_day][Infa].to = timesheet[new_day][Infa].from + 1 + Random(2);
                        break;
                    }
                }
            }
        }
    }


    if (is_set) {

        GotoXY(1, 8);
        ++klimov_timesheet_was_modified;
        TextColor(7);
        write(aKuzMenko_0);
        TextColor(0x0F);
        writeln(aViZnaeteKlimov);
        write(new_day + 0x16);
        write(aGoMaqS);

        write(timesheet[new_day][Infa].from);
        write(aPo);
        write(timesheet[new_day][Infa].to);
        writeln(aC__);

    } else {
        kuzmenko_speech();
    }

    await wait_for_key();
    TextColor(7);
    ClrScr();
} // end function 1C02B


async function djug_talk() {
    const aDjug_0 = "DJuG:";
    const aUVasKakoiToSko = "\"У Вас какой-то школьный метод решения задач...\"";
    const aNeObsaisqSTorm = "Не общайся с тормозами!";


    ClrScr();
    show_header_stats();
    GotoXY(1, 8);
    TextColor(7);
    writeln(aDjug_0);
    TextColor(0x0F);
    writeln(aUVasKakoiToSko);

    if (hero.subject[GiT].knowledge > 5) {
        hero.subject[GiT].knowledge -= Random(5);
    }

    decrease_health(0x0F, aNeObsaisqSTorm);
    await wait_for_key();
    TextColor(7);
    ClrScr();
} // end function 1C1FF


const aAndru_1 = "Эндрю: ";
const aSkajiDiamondUC = "\"Скажи Diamond'у, что маловато описалова!\"";
const aAEseDiamondDum = "\"А еще Diamond думал переписать это на JavaScript.\"";
const aAQZnauViigrisn = "\"А я знаю выигрышную стратегию! Если только не замочат...\"";
const aVoobseToVseAto = "\"Вообще-то, все это происходит в мае 1998 г.\"";
const aQVidelNadpisNa = "\"Я видел надпись на парте: ЗАКОН ВСЕМИРНОВА ТЯГОТЕНИЯ\"";
const aZaglqniNaMmh_0 = "\"Загляни на mmheroes.chat.ru!\"";
const aTolKoNePredlag = "\"Только не предлагай Diamond'у переписать все на Прологе!\"";
const aNuKogdaJeBudet = "\"Ну когда же будет порт под Linux?\"";
const aVmwareSuxx___N = "\"VMWARE - SUXX... Но под ним идут Heroes of Mat & Mech!\"";
const aPoxojeCtoMoqSt = "\"Похоже, что моя стратегия обламывается...\"";
const aUxTiGamma3_14V = "\"Ух ты! Гамма 3.14 - в этом что-то есть.\"";
const aMojetBitDiamon = "\"Может быть, Diamond'а просто заклинило на многоточиях?\"";
const aGovorqtMojnoZa = "\"Говорят, можно зарабатывать деньги, почти ничего не делая.\"";
const aVotInogdaMnePr = "\"Вот, иногда мне приходится тяжко - когда пристают всякие...\"";
const aXorosoLiCtoMno = "\"Хорошо ли, что многие реплики персонажей посвящены самой игре?\"";
const aPomogiteMneXoc = "\"Помогите мне! Хочу в Inet!\"";
const aACto = "\"А что? А ничего.\"";
const aEsliOnoCvetaBo = "\"Если оно цвета бордо - значит, оно тебе снится.\"";
const aVsexSDnemMatMe = "\"Всех с ДНЕМ МАТ-МЕХА!\"";
const aPridumaiSvouFr = "\"Придумай свою фразу для персонажа!\"";
const a120kIsxodnikov = "\"120К исходников - вот что такое mmHeroes!\"";
const a120kVesMaKrivi = "\"120К весьма кривых исходников - вот что такое mmHeroes!\"";
const aQPodozrevauC_0 = "\"Я подозреваю, что ";
const aNicegoTebeNeZa = " ничего тебе не засчитает.\"";
const aZactetTebeZa1Z = " зачтет тебе за 1 заход ";
const a__1 = ".\"";


function andrew_speech(subject) {
    TextColor(7);
    write(aAndru_1);
    TextColor(0x0F);

    if (Random(3) > 0) {

        const phrases = [
            aSkajiDiamondUC, aAEseDiamondDum, aAQZnauViigrisn, aVoobseToVseAto,
            aQVidelNadpisNa, aZaglqniNaMmh_0, aTolKoNePredlag, aNuKogdaJeBudet,
            aVmwareSuxx___N, aPoxojeCtoMoqSt, aUxTiGamma3_14V, aMojetBitDiamon,
            aGovorqtMojnoZa, aVotInogdaMnePr, aXorosoLiCtoMno, aPomogiteMneXoc,
            aACto, aEsliOnoCvetaBo, aVsexSDnemMatMe, aPridumaiSvouFr,
            a120kIsxodnikov, a120kVesMaKrivi
        ];
        writeln(RandomPhrase(phrases));

    } else {
        if (subject === -1) {
            subject = random_from_to(Algebra, Fizra);
        }
        let task_done = hero.subject[subject].knowledge - subjects[subject].member0xFA + Random(hero.brain);

        if (hero.health <= 5) {
            task_done -= Random(5 - hero.health);
        }

        if (task_done > 0) {
            task_done = Round(Sqrt(task_done) / subjects[subject].member0x100);
        } else {
            task_done = 0;
        }

        if (hero.subject[subject].tasks_done + task_done > subjects[subject].tasks) {
            task_done = subjects[subject].tasks - hero.subject[subject].tasks_done;
        }

        write(aQPodozrevauC_0);
        write(subjects[subject].professor.name);

        if (task_done === 0) {
            writeln(aNicegoTebeNeZa);
        } else {
            write(aZactetTebeZa1Z);
            write(task_done);
            zadanie_in_case(task_done);
            writeln(a__1);
        }
    }

    TextColor(7);

} // end function 1C6DC


const aObratitSqKAndr = "Обратиться к Эндрю за помощью?";
const aDaCemQXujeDrug = "Да, чем я хуже других?";
const aNetQUjKakNibud = "Нет, я уж как-нибудь сам...";
const aAndruVglqdivae = "Эндрю вглядывается в твои задачки,";
const aINacinaetDumat = "и начинает думать очень громко...";
const aPokaAndruTakNa = "Пока Эндрю так напрягается, ты не можешь ни на чем сосредоточиться!";
const aUAndruNicegoNe = "У Эндрю ничего не вышло...";
const aAndruResilTebe = "Эндрю решил тебе ";
const aNadoBudetPodoi = "Надо будет подойти с зачеткой!";
const aAndruTebqIgnor = "Эндрю тебя игнорирует!";
const aAndruTojeUmeet = "Эндрю тоже умеет отбиваться от разных нехороших людей.";


async function andrew_talk() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);

    if (current_subject === -1) {
        andrew_speech(current_subject);
    } else {
        write(aObratitSqKAndr);
        dialog_start();
        dialog_case(aDaCemQXujeDrug, -1);
        dialog_case(aNetQUjKakNibud, -2);
        const ax = await dialog_run(1, 0x0A);

        if (ax === -1) {

            if (Random(0x0E) < hero.charizma) {

                GotoXY(1, 0x0D);
                writeln(aAndruVglqdivae);
                writeln(aINacinaetDumat);
                writeln(aPokaAndruTakNa);

                const toSolve = subjects[current_subject].tasks - hero.subject[current_subject].tasks_done;
                let task_done = Trunc(Sqrt(Random(toSolve)));

                if (task_done > 2) {
                    task_done = 0;
                }

                hero.stamina -= Random(2);

                if (task_done === 0) {
                    writeln(aUAndruNicegoNe);
                } else {
                    TextColor(7);
                    write(aAndruResilTebe);
                    TextColor(0x0F);
                    write(task_done);
                    TextColor(7);
                    zadanie_in_case(task_done);
                    writeln("!");

                    hero.subject[current_subject].tasks_done += task_done;
                    if (!jl(hero.subject[current_subject].tasks_done, subjects[current_subject].tasks)) {
                        writeln(aNadoBudetPodoi);
                    }
                }

                await hour_pass();

            } else {
                GotoXY(1, 0x0D);
                TextColor(0x0C);
                writeln(aAndruTebqIgnor);
                decrease_health(Random(5) + 2, aAndruTojeUmeet);
            }

        } else if (ax === -2) {
            GotoXY(1, 0x0D);
            andrew_speech(current_subject);
        }

    }

    await wait_for_key();
    TextColor(7);
    ClrScr();
} // end function 1CC94


const aATiNeXocesUstr = "\"А ты не хочешь устроиться в ТЕРКОМ? Может, кое-чего подзаработаешь...\"";
const aDaMneBiNePomes = "Да, мне бы не помешало.";
const aNetQLucsePoucu = "Нет, я лучше поучусь уще чуток.";
const aPozdravlquTepe = "\"Поздравляю, теперь ты можешь идти в \"контору\"!\"";
const aKakXoces_TolKo = "\"Как хочешь. Только смотри, не заучись там ...\"";
const aKstatiQTutZnau = "\"Кстати, я тут знаю один качественно работающий прокси-сервер...\"";
const aTiZapisivaesAd = "Ты записываешь адрес. Вдруг пригодится?";
const aGrisa_1 = "Гриша:";
const aXocuXalqvi = "\"Хочу халявы!\"";
const aPriidiJeOXalqv = "\"Прийди же, о халява!\"";
const aXalqvaEstEeNeM = "\"Халява есть - ее не может не быть.\"";
const aDavaiOrganizue = "\"Давай организуем клуб любетелей халявы!\"";
const aCtobiPolucitDi = "\"Чтобы получить диплом, учиться совершенно необязательно!\"";
const aNuVotTiGotovil = "\"Ну вот, ты готовился... Помогло это тебе?\"";
const aNaTretEmKurseN = "\"На третьем курсе на лекции уже никто не ходит. Почти никто.\"";
const aVotBeriPrimerS = "\"Вот, бери пример с Коли.\"";
const aNenavijuLVaTol = "\"Ненавижу Льва Толстого! Вчера \"Войну и мир\" <йк> ксерил...\"";
const aAVPomiLucseVoo = "\"А в ПОМИ лучше вообще не ездить!\"";
const aImenaGlavnixXa = "\"Имена главных халявчиков и алкоголиков висят на баобабе.\"";
const aPravilNoLucseP = "\"Правильно, лучше посидим здесь и оттянемся!\"";
const aKonspektirovat = "\"Конспектировать ничего не надо. В мире есть ксероксы!\"";
const aASCetvertogoKu = "\"А с четвертого курса вылететь уже почти невозможно.\"";
const aVotUMexanikovU = "\"Вот у механиков - у них халява!\"";
const aIEsePoPivu___ = "И еще по пиву...";
const aGubitLudeiNePi = "Губит людей не пиво, а избыток пива.";
const aIEseOdinCasPro = "И еще один час прошел в бесплодных разговорах...";


async function grisha_talk() {
    ClrScr();
    show_header_stats();
    GotoXY(1, 8);

    if ((!hero.is_working_in_terkom) && hero.charizma > Random(20)) {

        TextColor(0x0E);
        write(aATiNeXocesUstr);

        dialog_start();
        dialog_case(aDaMneBiNePomes, -1);
        dialog_case(aNetQLucsePoucu, -2);
        const ax = await dialog_run(1, 0x0A);

        if (ax === -1) {
            hero.is_working_in_terkom = true;
            GotoXY(1, 0x0E);
            writeln(aPozdravlquTepe);
        } else if (ax === -2) {
            GotoXY(1, 0x0E);
            writeln(aKakXoces_TolKo);
        }

    } else {

        if (hero.charizma > Random(20) && !hero.has_inet) {
            writeln(aKstatiQTutZnau);
            TextColor(7);
            writeln();
            writeln(aTiZapisivaesAd);
            hero.has_inet = true;
        } else {

            GotoXY(1, 8);
            TextColor(7);
            write(aGrisa_1);
            TextColor(0x0E);

            const phrases = [
                aXocuXalqvi, aPriidiJeOXalqv, aXalqvaEstEeNeM, aDavaiOrganizue, aCtobiPolucitDi, aNuVotTiGotovil,
                aNaTretEmKurseN, aVotBeriPrimerS, aNenavijuLVaTol, aAVPomiLucseVoo, aImenaGlavnixXa, aPravilNoLucseP,
                aKonspektirovat, aASCetvertogoKu, aVotUMexanikovU
            ];

            const phrase = RandomPhrase(phrases);
            writeln(phrase);
            writeln();

            TextColor(7);
            if (Random(3) > 0) {
                writeln(aIEsePoPivu___);
                hero.brain -= Random(2);
                check_brain_dead(aGubitLudeiNePi);
                hero.charizma += Random(2);
            }

            if (Random(3) === 0) {
                writeln(aIEseOdinCasPro);
                await hour_pass();
            }
        }
    }

    await wait_for_key();
    ClrScr();
} // end function 1D30D


async function talk_with_classmate(classmate) {
    const talks = [
        kolya_talk, pawa_talk, diamond_dialog, rai_talk, misha_talk, serg_talk, sasha_talk,
        nil_talk, kuzmenko_talk, djug_talk, andrew_talk, grisha_talk
    ];
    const talk = talks[classmate];
    if (talk) {
        await talk();
    }
} // end function 1D6CE


async function week_brain_dream() {
    const aRozovieSloniki = "Розовые слоники с блестящими крылышками";
    const aZelenieCelovec = "Зеленые человечки с длинными антеннами";
    const aOveckiSOslepit = "Овечки с ослепительно-белой шерстью";
    const aSidqtSOkosevsi = "сидят с окосевшими глазами в Мавзолее";
    const aIScitautOprede = "и считают определитель матрицы 10 на 10";
    const aIIsutJordanovu = "и ищут Жорданову форму матрицы";
    const aIVozvodqtMatri = "и возводят матрицы в 239-ю степень";
    const aIResautLineinu = "и решают линейную систему уравнений с параметрами";
    const aIDokazivautNep = "и доказывают неприводимость многочлена 10-й степени над Z";
    const aIDokazivautSxo = "и доказывают сходимость неопределенного интеграла с параметрами";
    const aIScitautSummuR = "и считают сумму ряда с параметрами";
    const aIDifferenciruu = "и дифференцируют, дифференцируют, дифференцируют";
    const aIBerutIntergal = "и берут интергалы не отдают их";
    const aIResautZadaciP = "и решают задачи по математической болтологии";
    const a____7 = "...";
    const aGospodiNuIPris = "Господи! Ну и присниться же такое!";
    const aZaToTeperTiToc = "За то теперь ты точно знаешь,";
    const aCtoSnitsqStude = "что снится студентам-математикам,";
    const aKogdaOniVneKon = "когда они вне кондиции";

    ClrScr();
    TextColor(0x0D);

    const who = [aRozovieSloniki, aZelenieCelovec, aOveckiSOslepit];
    writeln(RandomPhrase(who));

    writeln(aSidqtSOkosevsi);

    const doing = [
        aIScitautOprede, aIIsutJordanovu, aIVozvodqtMatri, aIResautLineinu, aIDokazivautNep,
        aIDokazivautSxo, aIScitautSummuR, aIDifferenciruu, aIBerutIntergal, aIResautZadaciP
    ];
    writeln(RandomPhrase(doing));
    writeln(a____7);
    await ReadKey();
    writeln();
    writeln(aGospodiNuIPris);
    writeln(aZaToTeperTiToc);
    writeln(aCtoSnitsqStude);
    writeln(aKogdaOniVneKon);
    writeln(a____7);
    await ReadKey();
    hero.health = Random(0x0A) + 0xA;
} // end function 1DA3D


async function zauchilsya_dream() {
    const aTiSlisisMqgkii = "Ты слышишь мягкий, ненавязчивый голос:";
    const aAViDeistvitelN = "\"А Вы действительно правильно выбрали";
    const aSebeSpecialNos = " себе специальность?\"";
    const aIntegral___ = "\"Интеграл...\"";
    const aKakoiIntegral = "\"Какой интеграл?\"";
    const aDaVotJeOnMiEgo = "\"Да вот же он, мы его только что стерли!\"";
    const aViKonecnoVelik = "\"Вы, конечно, великий парильщик.";
    const aNoAtuZadacuQVa = " Но эту задачу я Вам засчитаю.\"";
    const aACtoUNasSegodn = "\"А что, у нас сегодня разве аудиторное занятие?\"";
    const aWellLastTimeIF = "\"Well, last time I found a pencil left by one of you.";
    const aIWillReturnItT = " I will return it to the owner, if he or she";
    const aCanTellMeSomeN = " can tell me some nice and pleasant words.";
    const aIAmALadyNotYou = " I am a lady, not your computer!\"";
    const aVSleduusemSe_0 = "\"В следующем семестре вы должны будете написать реферат";
    const aNaTemuBegVMiro = " на тему \"Бег в мировой литературе\". В качестве первоисточника";
    const aMojeteVzqtOdno = " можете взять одноименный роман Булгакова.\"";
    const aNuVsePoxojeZau = "Ну все, похоже, заучился - если преподы по ночам снятся...";

    ClrScr();
    TextColor(0x0D);

    if (last_subject === Algebra) {
        writeln(aTiSlisisMqgkii);
        writeln(aAViDeistvitelN);
        writeln(aSebeSpecialNos);
    } else if (last_subject === Matan) {
        writeln(aIntegral___);
        writeln(aKakoiIntegral);
        writeln(aDaVotJeOnMiEgo);
    } else if (last_subject === GiT) {
        writeln(aViKonecnoVelik);
        writeln(aNoAtuZadacuQVa);
    } else if (last_subject === Infa) {
        writeln(aACtoUNasSegodn);
    } else if (last_subject === English) {
        writeln(aWellLastTimeIF);
        writeln(aIWillReturnItT);
        writeln(aCanTellMeSomeN);
        writeln(aIAmALadyNotYou);
    } else if (last_subject === Fizra) {
        writeln(aVSleduusemSe_0);
        writeln(aNaTemuBegVMiro);
        writeln(aMojeteVzqtOdno);
    }

    writeln();
    writeln(aNuVsePoxojeZau);
    await ReadKey();
} // end function 1DF40


const aZdravstvuite__ = "\"Здравствуйте!\" ...";
const aOnoBolSoe___ = "Оно большое ...";
const aOnoPixtit___ = "Оно пыхтит! ...";
const aOnoMedlennoPol = "Оно медленно ползет прямо на тебя!!! ...";
const aOnoGovoritCelo = "Оно говорит человеческим голосом:";
const aMolodoiCelovek = "\"Молодой человек. Когда-нибудь Вы вырастете";
const aIBudeteRabotat = "и будете работать на большой машине.";
const aVamNadoBudetNa = "Вам надо будет нажать кнопку жизни,";
const aAViNajmeteKnop = "а Вы нажмете кнопку смерти ...\"";
const aAtoVSredneveko = "\"Это в средневековье ученые спорили,";
const aSkolKoCerteiMo = "сколько чертей может поместиться";
const aNaKoncikeIgli_ = "на кончике иглы...\"";
const aZadaciMojnoRes = "\"Задачи можно решать по-разному.";
const aMojnoUstnoMojn = "Можно устно, можно на бумажке,";
const aMojnoIgraqVKre = "можно - играя в крестики-нолики...";
const aAMojnoProstoSp = "А можно - просто списать ответ в конце задачника!\"";
const a____8 = "...";
const aUfff___CtoToSe = "Уффф... Что-то сегодня опять какие-то гадости снятся.";
const aVsePoraZavqziv = "Все, пора завязывать с этим. Нельзя так много учиться.";


async function knows_djug_dream() {
    ClrScr();
    TextColor(0x0D);
    writeln(aZdravstvuite__);
    await ReadKey();
    writeln(aOnoBolSoe___);
    await ReadKey();
    writeln(aOnoPixtit___);
    await ReadKey();
    writeln(aOnoMedlennoPol);
    await ReadKey();
    writeln(aOnoGovoritCelo);
    TextColor(7);

    const ax = Random(3);
    if (ax === 0) {
        writeln(aMolodoiCelovek);
        writeln(aIBudeteRabotat);
        writeln(aVamNadoBudetNa);
        writeln(aAViNajmeteKnop);
    } else if (ax === 1) {
        writeln(aAtoVSredneveko);
        writeln(aSkolKoCerteiMo);
        writeln(aNaKoncikeIgli_);
    } else if (ax === 2) {
        writeln(aZadaciMojnoRes);
        writeln(aMojnoUstnoMojn);
        writeln(aMojnoIgraqVKre);
        writeln(aAMojnoProstoSp);
    }

    TextColor(0x0D);
    writeln(a____8);
    await ReadKey();
    writeln();
    writeln(aUfff___CtoToSe);
    writeln(aVsePoraZavqziv);
    await ReadKey();
    hero.health = Random(0x0A) + 0xA;
} // end function 1E37C


async function hero_dream() {
    const aPrevratilsqVOv = "Превратился в овощ.";
    let dream_scenario = 0;

    for (let i = 0; i < 3; ++i) {
        synopsis[i].sasha_has = true;
    }

    hero.is_invited = false;
    if (hero.brain <= 2) {
        hero.brain = 2;
        dream_scenario = 1;
    }

    if (hero.stamina <= 0) {
        is_end = true;
        hero.health = 0;
        death_cause = aPrevratilsqVOv;
    }

    if (hero.knows_djug) {
        dream_scenario = 2;
    }

    if (Random(2) === 0) {
        if (dream_scenario === 1) {
            // week brain
            await week_brain_dream();
        } else if (dream_scenario === 2) {
            await knows_djug_dream();
        } else {
            if (Random(3) === 0) {
                await zauchilsya_dream();
            }
        }
    }

    hero.knows_djug = false;
} // end function 1E5A3


async function rest_in_obschaga() {
    hero.health += 7 + Random(8);
    await hour_pass();
} // end function 1E647


async function request_exit() {
    await prompt_exit();
} // end function 1E66B


async function goto_sleep() {
    const aVremqVislo_ = "Время вышло.";

    current_subject = -1;
    current_place = Obshaga;

    if (day_of_week > 5) {
        is_end = true;
        death_cause = aVremqVislo_;
        return;
    }

    if (hero.health > 0x28) {
        hero.health = 0x28;
    }

    let health_addition = hero.health + 0xF + Random(0x14);

    if (health_addition > 50) {
        health_addition = 50;
    }

    health_addition -= hero.health;
    hero.health += health_addition;
    const sleep_time = Random(idiv(health_addition, 4)) + 7;
    time_of_day += sleep_time;

    if (time_of_day > 23) {

        time_of_day %= 24;
        ++day_of_week;

        if (day_of_week > 5) {
            is_end = true;
            death_cause = aVremqVislo_;
        } else {
            // #warning new code
            send_replay();
        }
    }

    await hero_dream();

    if (time_of_day <= 4) {
        time_of_day = 5;
    }

    if (hero.garlic > 0) {
        --hero.garlic;
        hero.charizma += Random(2);
    }

} // end function 1E682


async function pomi_midnight() {
    const aTiGlqdisNaCasi = "Ты глядишь на часы и видишь: уже полночь!";
    const aNaPosledneiAle = "На последней электричке ты едешь домой, в общагу.";
    const aZasnulVAlektri = "Заснул в электричке и не проснулся.";


    ClrScr();
    TextColor(7);
    writeln(aTiGlqdisNaCasi);
    writeln(aNaPosledneiAle);
    decrease_health(4, aZasnulVAlektri);

    current_place = Obshaga;
    current_subject = -1;
    await wait_for_key();
    ClrScr();
} // end function 1E7F8


async function punk_midnight() {
    const aVaxtersaGlqdit = "Вахтерша глядит на тебя странными глазами:";
    const aCtoMojetDelatB = "что может делать бедный студент в университете в полночь?";
    const aNeZnaqOtvetNaA = "Не зная ответ на этот вопрос, ты спешишь в общагу.";


    ClrScr();
    TextColor(7);
    writeln(aVaxtersaGlqdit);
    writeln(aCtoMojetDelatB);
    writeln(aNeZnaqOtvetNaA);
    current_place = Obshaga;
    current_subject = -1;
    await wait_for_key();
    ClrScr();
} // end function 1E907


const aMavzoleiZakriv = "Мавзолей закрывается.";
const aPoraDomoi = "Пора домой!";


async function mavzoley_midnight() {
    ClrScr();
    TextColor(7);
    writeln(aMavzoleiZakriv);
    writeln(aPoraDomoi);
    current_place = 4;
    current_subject = -1;
    await wait_for_key();
    ClrScr();
} // end function 1E993


async function midnight() {
    if (current_place === Pomi) {
        await pomi_midnight();
    } else if (current_place === Punk) {
        await punk_midnight();
    } else if (current_place === Mavzoley) {
        await mavzoley_midnight();
    } else if (current_place === Obshaga) {
        await goto_sleep();
    }
} // end function 1E9E7


const aDjugAtoSmertel = "DJuG - это смертельно!";
const aBurnoProgressi = "Бурно прогрессирующая паранойя.";


async function hour_pass() {
    terkom_has_places = true;
    ++time_of_day;

    if (current_subject === GiT && current_place === Pomi) {
        decrease_health(6, aDjugAtoSmertel);
        hero.knows_djug = true;
    }

    if (hero.charizma <= 0) {
        hero.health = 0;
        is_end = true;
        death_cause = aBurnoProgressi;
    }

    if (time_of_day === 24) {
        ++day_of_week;
        send_replay();
        time_of_day = 0;
        await midnight();
    }

    //    if (hero.charizma > Random(0x0A)) {
    //        byte_254A4 = 0;
    //    }
    init_classmates();

} // end function 1EA4F


async function prompt_exit() {
    const aNuMojetNeNadoT = "Ну, может не надо так резко...";
    const aTiCtoSerEznoXo = "Ты что, серьезно хочешь закончить игру?";
    const aNetNeXocu = "Нет, не хочу!";
    const aQJeSkazalSMenq = "Я же сказал: с меня хватит!";
    const aViselSam_ = "Вышел сам.";

    ClrScr();
    writeln(aNuMojetNeNadoT);
    writeln(aTiCtoSerEznoXo);
    dialog_start();
    dialog_case(aNetNeXocu, -1);
    dialog_case(aQJeSkazalSMenq, -2);
    const ax = await dialog_run(1, 4);
    if (ax === -2) {
        is_end = true;
        death_cause = aViselSam_;
    }
    ClrScr();
} // end function 1EB5C


function is_professor_here(subj) {
    if (day_of_week >= 0 && day_of_week <= 5) {
        const ts = timesheet[day_of_week][subj];
        return time_of_day >= ts.from && time_of_day < ts.to && ts.where === current_place;
    } else {
        return false;
    }
} // end function 1EBE0


function is_professor_here_today(subj) {
    if (day_of_week >= 0 && day_of_week <= 5) {
        return timesheet[day_of_week][subj].where === current_place;
    } else {
        return false;
    }
} // end function 1EC48


function time_between_9_and_19() {
    return time_of_day > 8 && time_of_day < 20;
}


function init_kolya(/*arg_0*/) {
    if (time_between_9_and_19()) {
        classmates[Kolya].place = 5;
    } else {
        classmates[Kolya].place = 0;
    }
    classmates[Kolya].current_subject = -1;
} // end function 1EC97


function init_classmate_place(student) {
    let some_professor_here = false;
    let go_to_exam = false;
    do {
        for (let subj = Algebra; subj <= GiT; ++subj) {
            if (is_professor_here_today(subj)) {
                some_professor_here = true;
                if (Random(0x0A) > 5) {
                    go_to_exam = true;
                    classmates[student].place = timesheet[day_of_week][subj].where;
                    classmates[student].current_subject = subj;
                }
            }
        }
    } while (!go_to_exam && some_professor_here);
}

function init_pasha(/*arg_0*/) {
    // #warning arg_0, [arg_0 + var_2 + 0|1]

    if (time_between_9_and_19()) {
        classmates[Pasha].place = Punk;
    } else {
        classmates[Pasha].place = Nowhere;
    }

    classmates[Pasha].current_subject = -1;
    init_classmate_place(Pasha);

} // end function 1ECBC


function init_diamond(/*arg_0*/) {
    // #warning arg_0, [arg_0 + var_2 + 1]

    if (time_between_9_and_19()) {
        classmates[Diamond].place = Kompy;
    } else {
        classmates[Diamond].place = Nowhere;
    }

    classmates[Diamond].current_subject = -1;

    for (let subj = 5; subj >= 0; --subj) {

        if (is_professor_here_today(subj)) {
            if (Random(0x0A) > 5) {
                classmates[Diamond].place = timesheet[day_of_week][subj].where;
                classmates[Diamond].current_subject = subj;
            }
        }
    }

} // end function 1ED56


function init_rai(/*arg_0*/) {
    if (is_professor_here(Algebra)) {
        classmates[Rai].place = timesheet[day_of_week][Algebra].where;
        classmates[Rai].current_subject = 0;
        return;
    }

    if (is_professor_here(Matan)) {
        classmates[Rai].place = timesheet[day_of_week][Matan].where;
        classmates[Rai].current_subject = 1;
        return;
    }

    if (time_between_9_and_19()) {
        classmates[Rai].place = 3;
    } else {
        classmates[Rai].place = 0;
    }

    classmates[Rai].current_subject = -1;
} // end function 1EDCC


function init_classmate_place_by_subj(student, subjTo, exclude) {
    let some_professor_here = false;
    let go_to_exam = false;
    do {
        for (let subj = subjTo; subj >= Algebra; --subj) {
            if (is_professor_here_today(subj)) {
                if (subj === exclude) {
                    continue;
                }
                some_professor_here = true;
                if (Random(0x0A) > 5) {
                    go_to_exam = true;
                    classmates[student].place = timesheet[day_of_week][subj].where;
                    classmates[student].current_subject = subj;
                }
            }
        }
    } while (!go_to_exam && some_professor_here);
}

function init_misha(/*arg_0*/) {
    // #warning arg_0, [arg_0 + var_2 + 0|1]

    if (time_between_9_and_19()) {
        classmates[Misha].place = Punk;
    } else {
        classmates[Misha].place = Nowhere;
    }

    classmates[Misha].current_subject = -1;
    init_classmate_place_by_subj(Misha, English, Kompy);

} // end function 1EE2C


function init_serg(/*arg_0*/) {
    // #warning arg_0, [arg_0 + var_2 + 0|1]

    if (time_between_9_and_19()) {
        classmates[Serzg].place = 1;
    } else {
        classmates[Serzg].place = 0;
    }

    classmates[Serzg].current_subject = -1;
    init_classmate_place_by_subj(Serzg, Fizra);
} // end function 1EECC


function init_sasha(/*arg_0*/) {
    classmates[Sasha].current_subject = -1;
    if (time_between_9_and_19()) {
        if (jz(Random(4), 0)) {
            classmates[Sasha].place = 1;
        } else {
            classmates[Sasha].place = 0;
        }
    } else {
        classmates[Sasha].place = 0;
    }
} // end function 1EF66


function init_nil(/*arg_0*/) {
    // #warning arg_0, [arg_0 + var_2 + 0|1]

    classmates[Nil].place = Nowhere;
    classmates[Nil].current_subject = -1;
    init_classmate_place(Nil);
} // end function 1EF9E


function init_kuzmenko(/*arg_0*/) {
    if (time_between_9_and_19() && Random(4) === 0) {
        classmates[Kuzmenko].place = Kompy;
    } else {
        classmates[Kuzmenko].place = Nowhere;
    }
    classmates[Kuzmenko].current_subject = -1;
} // end function 1F025


function init_djug() {
    classmates[Djug].place = 2;
    classmates[Djug].current_subject = 2;
} // end function 1F05B


function init_andrew() {
    classmates[Endryu].place = Punk;
    classmates[Endryu].current_subject = Matan;

    for (let subj = Algebra; subj <= GiT; ++subj) {
        if (is_professor_here_today(subj)) {
            if (Random(0x0A) > 5) {
                classmates[Endryu].place = timesheet[day_of_week][subj].where;
                classmates[Endryu].current_subject = subj;
            }
        }
    }

} // end function 1F06D


function init_grisha() {
    classmates[Grisha].current_subject = -1;
    if (Random(3) === 0) {
        classmates[Grisha].place = Mavzoley;
    } else {
        classmates[Grisha].place = Nowhere;
    }
} // end function 1F0C6


function init_classmates() {
    init_kolya();
    init_diamond();
    init_pasha();
    init_rai();
    init_misha();
    init_serg();
    init_sasha();
    init_nil();
    init_kuzmenko();
    init_djug();
    init_andrew();
    init_grisha();
} // end function 1F184


// =============================================================================

function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}


function zadanie_in_case(number) {
    const aZadanie = " задание";
    const aZadaniq = " задания";
    const aZadanii = " заданий";

    const word = declOfNum(number, [aZadanie, aZadaniq, aZadanii]);
    write(word);
} // end function 1F1CB


function colored_output(color, str) {
    current_color = color;
    write(str);
    current_color = 7;
} // end function 1F22A


function colored_output_ln(color, str) {
    current_color = color;
    writeln(str);
    current_color = 7;
} // end function 1F26B


function output_with_highlighted_num(color, before, color_hi, number, after) {
    current_color = color;
    write(before);
    current_color = color_hi;
    write(number);
    current_color = color;
    write(after);
    current_color = 7;
} // end function 1F2AC


function colored_output_white(str) {
    colored_output(0x0F, str);
} // end function 1F335


const aSegodnq = "Сегодня ";
const aEMaq = "е мая; ";
const asc_1F36E = "";
const a00 = ":00";
const aVersiq_0 = "Версия ";
const aSamocuvstvie = "Самочувствие: ";
const aJivoiTrup = "живой труп";
const aPoraPomirat___ = "пора помирать ...";
const aPloxoe = "плохое";
const aTakSebe = "так себе";
const aSrednee = "среднее";
const aXorosee = "хорошее";
const aOtlicnoe = "отличное";
const aPloxo = "Плохо";
const aUdovl_ = "Удовл.";
const aXoroso = "Хорошо";
const aOtlicno = "Отлично";
const aFinansi = "Финансы: ";
const aRub__3 = " руб.";
const aNadoPolucitDen = "Надо получить деньги за май...";
const aTiUspelPotrati = "Ты успел потратить все деньги.";
const aKliniceskaqSme = "Клиническая смерть мозга";
const aGolovaProstoNi = "Голова просто никакая";
const aDumatPraktices = "Думать практически невозможно";
const aDumatTrudno = "Думать трудно";
const aGolovaPoctiVNo = "Голова почти в норме";
const aGolovaVNorme = "Голова в норме";
const aGolovaSvejaq = "Голова свежая";
const aLegkostVMislqx = "Легкость в мыслях необыкновенная";
const aObratitesKRazr = "Обратитесь к разработчику ;)";
const aMamaRodiMenqOb = "Мама, роди меня обратно!";
const aOkoncatelNoZau = "Окончательно заучился";
const aQTakBolSeNemog = "Я так больше немогууу!";
const aSkoreeBiVseAto = "Скорее бы все это кончилось...";
const aEseNemnogoIPor = "Еще немного и пора отдыхать";
const aNemnogoUstal = "Немного устал";
const aGotovKTruduIOb = "Готов к труду и обороне";
const aNasJdutVelikie = "Нас ждут великие дела";
const aOcenZamknutiiT = "Очень замкнутый товарищ";
const aPredpocitaesOd = "Предпочитаешь одиночество";
const aTebeTrudnoObsa = "Тебе трудно общаться с людьми";
const aTebeNeprostoOb = "Тебе непросто общаться с людьми";
const aTiNormalNoOtno = "Ты нормально относишься к окружающим";
const aUTebqMnogoDruz = "У тебя много друзей";
const aUTebqOcenMnogo = "У тебя очень много друзей";


function show_header_stats() {
    ClrScr();
    GotoXY(1, 1);
    output_with_highlighted_num(7, aSegodnq, 0xF, day_of_week + 0x16, aEMaq);
    output_with_highlighted_num(0xF, asc_1F36E, 0xF, time_of_day, a00);
    GotoXY(0x1A, 1);

    colored_output(0xD, aVersiq_0 + aGamma3_14);
    GotoXY(1, 2);
    write(aSamocuvstvie);

    const health_line = [1, 9, 17, 25, 33, 41];
    const health_str = [aJivoiTrup, aPoraPomirat___, aPloxoe, aTakSebe, aSrednee, aXorosee, aOtlicnoe];
    const health_col = [5, 4, 4, 0xE, 0xE, 0xA, 0xA];
    const health_i = _upper_bound(health_line, hero.health);
    colored_output(health_col[health_i], health_str[health_i]);


    const knowledge_line = [6, 13, 21, 31];
    const knowledge_col = [3, 7, 0xF, 0xA, 0xE];
    const knowledge_subj_line = [
        [0xB, 0x15, 0x33],
        [9, 0x13, 0x29],
        [6, 0xB, 0x1F],
        [0xA, 0x10, 0x1F],
        [5, 9, 0x10],
        [5, 9, 0x10]
    ];
    const knowledge_subj_str = [aPloxo, aUdovl_, aXoroso, aOtlicno];
    const knowledge_subj_col = [3, 7, 0xF, 0xE];

    for (let subj = 0; subj <= 5; ++subj) {
        GotoXY(0x2D, subj + 1);
        colored_output(0xB, subjects[subj].title);

        GotoXY(0x43, subj + 1);
        const ax = hero.subject[subj].knowledge;
        current_color = knowledge_col[_upper_bound(knowledge_line, ax)];
        write(hero.subject[subj].knowledge);

        GotoXY(0x47, subj + 1);
        const k_i = _upper_bound(knowledge_subj_line[subj], ax);
        colored_output(knowledge_subj_col[k_i], knowledge_subj_str[k_i]);

        current_color = 7;
    }


    GotoXY(1, 3);
    colored_output(7, aFinansi);


    if (hero.money > 0) {
        TextColor(0x0F);
        write(hero.money);
        TextColor(7);
        write(aRub__3);
    } else if (!hero.got_stipend) {
        colored_output(0x0C, aNadoPolucitDen);
    } else {
        write(aTiUspelPotrati);
    }


    GotoXY(1, 4);
    const brain_line = [0, 1, 2, 3, 4, 5, 6, 0x65];
    const brain_str = [aKliniceskaqSme, aGolovaProstoNi, aDumatPraktices, aDumatTrudno, aGolovaPoctiVNo,
        aGolovaVNorme, aGolovaSvejaq, aLegkostVMislqx, aObratitesKRazr];
    const brain_col = [5, 5, 0xC, 0xC, 0xE, 0xE, 0xA, 0xA, 0xB];
    const brain_i = _upper_bound(brain_line, hero.brain);
    colored_output(brain_col[brain_i], brain_str[brain_i]);


    GotoXY(1, 5);
    const stamina_line = [0, 1, 2, 3, 4, 5, 6];
    const stamina_str = [aMamaRodiMenqOb, aOkoncatelNoZau, aQTakBolSeNemog, aSkoreeBiVseAto, aEseNemnogoIPor,
        aNemnogoUstal, aGotovKTruduIOb, aNasJdutVelikie];
    const stamina_col = [5, 5, 0xC, 0xC, 0xE, 0xE, 0xA, 0xA];
    const stamina_i = _upper_bound(stamina_line, hero.stamina);
    colored_output(stamina_col[stamina_i], stamina_str[stamina_i]);

    GotoXY(1, 6);
    const charizma_line = [1, 2, 3, 4, 5, 6];
    const charizma_str = [aOcenZamknutiiT, aPredpocitaesOd, aTebeTrudnoObsa, aTebeNeprostoOb,
        aTiNormalNoOtno, aUTebqMnogoDruz, aUTebqOcenMnogo];
    const charizma_col = [5, 5, 0xC, 0xC, 0xE, 0xA, 0xA];
    const charizma_i = _upper_bound(charizma_line, hero.charizma);
    colored_output(charizma_col[charizma_i], charizma_str[charizma_i]);
} // end function 1F685


function show_timesheet_day(day_color, day, subj) {
    const asc_1FD4D = "██████";
    TextColor(hero.subject[subj].passed ? 1 : day_color);

    const ts = timesheet[day][subj];
    if (ts.where != 0) {
        GotoXY(day * 7 + 0x18, subj * 3 + 2);
        write(places[ts.where].title);
        GotoXY(day * 7 + 0x18, subj * 3 + 3);
        write(ts.from);
        write("-");
        write(ts.to);
    } else {
        TextColor(day_color > 8 ? 6 : 8);
        GotoXY(day * 7 + 0x18, subj * 3 + 2);
        write(asc_1FD4D);
        GotoXY(day * 7 + 0x18, subj * 3 + 3);
        write(asc_1FD4D);
    }

    // #warning only use
    //TextBackground(0);
} // end function 1FD54


function show_timesheet() {
    const aOstalos = "Осталось";
    const aPodoitiS = "Подойти с";
    const aZacetkoi = "зачеткой";
    const aZacet = "ЗАЧЕТ";
    const a_05 = ".05";
    const aVseUjeSdano = "Все уже сдано!";
    const aOstalsq = "Остался ";
    const aZacet_0 = " зачет!";
    const aOstalos_0 = "Осталось ";
    const aZaceta_ = " зачета.";
    const aZacetov_ = " зачетов.";


    for (let subj = Algebra; subj <= Fizra; ++subj) {
        TextColor(7);
        GotoXY(1, subj * 3 + 2);
        colored_output(0xA, subjects[subj].professor.name);
        GotoXY(1, subj * 3 + 3);
        colored_output(0xB, subjects[subj].title);

        for (let day = 0; day <= 5; ++day) {
            show_timesheet_day(day === day_of_week ? 0xE : 7, day, subj);
        }
    }

    for (let day = 0; day <= 5; ++day) {
        TextColor(7);
        GotoXY(day * 7 + 0x18, 1);
        colored_output(0xB, days[day]);
    }

    for (let subj = 0; subj <= 5; ++subj) {
        if (!hero.subject[subj].passed) {
            if (subjects[subj].tasks > hero.subject[subj].tasks_done) {
                TextColor(7);
                GotoXY(0x46, subj * 3 + 2);
                write(aOstalos);
                GotoXY(0x46, subj * 3 + 3);
                colored_output_white(subjects[subj].tasks - hero.subject[subj].tasks_done);
                zadanie_in_case(subjects[subj].tasks - hero.subject[subj].tasks_done);
            } else {
                TextColor(7);
                GotoXY(0x46, subj * 3 + 2);
                writeln(aPodoitiS);
                GotoXY(0x46, subj * 3 + 3);
                writeln(aZacetkoi);
            }
        } else {
            TextColor(0xF);
            GotoXY(0x46, subj * 3 + 2);
            write(aZacet);
            GotoXY(0x46, subj * 3 + 3);
            write(hero.subject[subj].pass_day + 22);
            write(a_05);
        }
    }

    TextColor(7);
    GotoXY(1, 0x17);

    if (hero.exams_left === 0) {
        colored_output(0xF, aVseUjeSdano);
    } else if (hero.exams_left === 1) {
        output_with_highlighted_num(7, aOstalsq, 0xD, 1, aZacet_0);
    } else if (hero.exams_left < 5) {
        output_with_highlighted_num(7, aOstalos_0, 0xE, hero.exams_left, aZaceta_);
    } else {
        output_with_highlighted_num(7, aOstalos_0, 0xE, hero.exams_left, aZacetov_);
    }

    GotoXY(1, 7);
} // end function 1FF27


function show_short_today_timesheet(y) {
    for (let subj = 0; subj <= 5; ++subj) {
        const ts = timesheet[day_of_week][subj];

        TextColor(hero.subject[subj].passed ? 1 : 0xB);
        GotoXY(0x32, y + subj);
        write(subject_short_titles[subj]);

        TextColor(hero.subject[subj].passed ? 5 : 0xC);
        GotoXY(0x3A, y + subj);
        write(places[ts.where].title);

        if (ts.where != 0) {
            TextColor(hero.subject[subj].passed ? 8 : 0xF);
            GotoXY(0x40, y + subj);
            write(ts.from);
            write("-");
            write(ts.to);
        }

        GotoXY(0x48, y + subj);
        if (hero.subject[subj].tasks_done === 0) {
            TextColor(7);
        } else if (hero.subject[subj].tasks_done < subjects[subj].tasks) {
            TextColor(0xA);
        } else {
            TextColor(0xE);
        }
        write(hero.subject[subj].tasks_done);
        write("/");
        write(subjects[subj].tasks);
    }

    TextColor(7);
} // end function 201DC


function init_timesheet() {
    for (let subj = 0; subj <= 5; ++subj) {
        for (let day = 0; day <= 5; ++day) {
            timesheet[day][subj].from =
                timesheet[day][subj].to =
                    timesheet[day][subj].where = 0;
        }
    }

    for (let subj = 0; subj <= 5; ++subj) {
        const day_used = [0, 0, 0, 0, 0, 0];
        if (subjects[subj].exam_days >= 1) {
            for (let i = 1; i <= subjects[subj].exam_days; ++i) {
                let day;
                do {
                    day = random_from_to(0, 5);
                } while (day_used[day]);

                timesheet[day][subj].from =
                    random_from_to(9, 18 - subjects[subj].exam_max_time);

                const exam_time = random_from_to(
                    subjects[subj].exam_min_time,
                    subjects[subj].exam_max_time);

                timesheet[day][subj].to = timesheet[day][subj].from + exam_time;
                timesheet[day][subj].where = subjects[subj].exam_places[Random(3)];

                day_used[day] = 1;
            }
        }
    }
} // end function 203A0


function inception_reinit_timesheet() {
    // Тут deep copy
    const old_timesheet = [];
    for (let i = 0; i < 6; ++i) {
        old_timesheet.push([]);
        for (let j = 0; j < 6; ++j) {
            old_timesheet[i].push({from: timesheet[i][j].from, to: timesheet[i][j].to, where: timesheet[i][j].where});
        }
    }
    init_timesheet();
    for (let i = 0; i <= day_of_week; ++i) {
        timesheet[i] = old_timesheet[i]; // 0x1E bytes
    }
} // end function 204C8


async function init_hero_interactive() {
    const aViberiNacalNie = "Выбери начальные параметры своего \"героя\":";
    const aSlucainiiStude = "Случайный студент";
    const aSibkoUmnii = "Шибко умный";
    const aSibkoNaglii = "Шибко наглый";
    const aSibkoObsitelNi = "Шибко общительный";
    const aGodRejim = "GOD-режим";

    ClrScr();
    writeln(aViberiNacalNie);

    dialog_start();
    dialog_case(aSlucainiiStude, -1);
    dialog_case(aSibkoUmnii, -2);
    dialog_case(aSibkoNaglii, -3);
    dialog_case(aSibkoObsitelNi, -4);
    if (is_god_mode_available) {
        dialog_case(aGodRejim, -100);
    }

    is_god_mode = 0;

    const res = await dialog_run(1, 3);
    if (res === -1) {
        hero.brain = Random(3) + 4;
        hero.stamina = Random(3) + 4;
        hero.charizma = Random(3) + 4;
    } else if (res === -2) {
        hero.brain = Random(5) + 5;
        hero.stamina = Random(3) + 2;
        hero.charizma = Random(3) + 2;
    } else if (res === -3) {
        hero.brain = Random(3) + 2;
        hero.stamina = Random(5) + 5;
        hero.charizma = Random(3) + 2;
    } else if (res === -4) {
        hero.brain = Random(3) + 2;
        hero.stamina = Random(3) + 2;
        hero.charizma = Random(5) + 5;
    } else if (res === -100) {
        is_god_mode = 1;
        hero.brain = 0x1E;
        hero.stamina = 0x1E;
        hero.charizma = 0x1E;
    }

    ClrScr();
} // end function 20597


async function init_hero() {
    hero.garlic = 0;
    hero.money = 0;
    hero.inception = 0;
    hero.got_stipend = false;
    hero.knows_djug = false;
    hero.has_mmheroes_disk = false;
    hero.is_working_in_terkom = false;

    // #warning no refs
    // byte_2549F = 0;

    if (ParamCount()) {
        await init_hero_interactive();
    } else {
        // #warning
        hero.brain = /*200;*/ Random(3) + 4;
        hero.stamina = /*200;*/ Random(3) + 4;
        hero.charizma = /*200;*/ Random(3) + 4;
    }

    // #warning no refs
    /*
    word_256CE = hero.brain;
    asc_256D2 = hero.stamina;
    word_256D0 = hero.charizma;
*/

    day_of_week = 0;
    time_of_day = 8;
    current_place = Obshaga;
    current_subject = -1;

    hero.health = Random(hero.stamina * 2) + 0x28;

    // #warning no refs
    // word_2559A = hero.health;

    hero.exams_left = 6;
    hero.has_ticket = 0;
    is_end = false;
    death_cause = 0;
    klimov_timesheet_was_modified = 0;
    hero.is_invited = false;

    // #warning no refs
    // byte_254A4 = 0;

    hero.has_inet = false;
} // end function 206E4


async function check_exams_left_count() {
    const aBad_cred_count = "bad_cred_count";
    let exams_left = 6;
    for (let i = 0; i < 6; ++i) {
        if (hero.subject[i].passed) {
            --exams_left;
        }
    }
    if (exams_left !== hero.exams_left) {
        await bug_report(aBad_cred_count);
    }
} // end function 207BF


function init_knowledge_synopsis_classmate() {
    for (let subj = 0; subj <= 5; ++subj) {
        hero.subject[subj] = {
            tasks_done: 0,
            pass_day: -1,
            knowledge: Random(hero.brain),
            passed: false
        };
    }

    for (let subj = 0; subj <= 2; ++subj) {
        synopsis[subj].sasha_has = true;
        synopsis[subj].hero_has = false;
    }

    for (let i = 0; i <= 0xB; ++i) {
        classmates[i].current_subject = -1;
    }
} // end function 207FA


async function init_game() {
    await init_hero();
    init_timesheet();
    init_knowledge_synopsis_classmate();

} // end function 20889


async function wait_for_key() {
    const aNajmiLubuuKlav = "Нажми любую клавишу ...";
    GotoXY(1, 24);
    current_color = 0x0E;
    write(aNajmiLubuuKlav);
    current_color = 7;
    //if (ReadKey() == 0) {
    await ReadKey();
    //}
} // end function 208B8


async function bug_report(bug_str) {
    const aVProgrammeBuga = "В программе буга! Код : ";
    const aSrocnoObratite = "Срочно обратитесь к разработчику ;)";
    const aRazdavlenBezja = "Раздавлен безжалостной ошибкой в программе.";

    ClrScr();
    current_color = 0x8F;
    write(aVProgrammeBuga);
    writeln(bug_str);
    writeln(aSrocnoObratite);
    is_end = true;
    hero.health = -100;
    death_cause = aRazdavlenBezja;
    await wait_for_key();
} // end function 2095D


function random_from_to(from, to) {
    return from + Random(to - from + 1);
} // end function 209E0


function decrease_health(num, death_str) {
    hero.health -= num;

    if (hero.health <= 0) {
        hero.health = 0;
        is_end = true;
        death_cause = death_str;
    }
} // end function 20A10

function check_brain_dead(death_str) {
    if (hero.brain <= 0) {
        hero.health = 0;
        is_end = true;
        death_cause = death_str;
    }
}


function dialog_start() {
    dialog_case_count = 0;
} // end function 20A60


function dialog_case(str, num) {
    dialog[dialog_case_count++] = {str: str, num: num, color: 0xB};
} // end function 20A6A


function dialog_case_colored(str, num, color) {
    dialog[dialog_case_count++] = {str: str, num: num, color: color};
} // end function 20AC5


function dialog_show(x, y) {
    current_color = 0xB;
    for (let i = 0; i < dialog_case_count; ++i) {
        GotoXY(x, y + i);
        current_color = dialog[i].color;
        write(dialog[i].str);
    }
    current_color = 7;
} // end function 20B20

export default Main;
