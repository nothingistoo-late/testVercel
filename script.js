const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
let deck = [];
let playerHand = [];
let aiHand = [];
let communityCards = [];
let phase = 0;

function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ value, suit });
        }
    }
    deck.sort(() => Math.random() - 0.5);
}

function dealCards() {
    if (deck.length === 0) {
        console.log("Deck is empty! Cannot deal more cards.");
        return;
    }

    switch (phase) {
        case 0:
            // Chia bài tẩy cho người chơi và AI
            playerHand = deck.splice(0, 2);
            aiHand = deck.splice(0, 2);
            break;
        case 1:
            // Flop: Chia 3 lá bài chung đầu tiên
            communityCards = deck.splice(0, 3);
            break;
        case 2:
            // Turn: Chia 1 lá bài chung thứ tư
            communityCards.push(deck.shift());
            break;
        case 3:
            // River: Chia 1 lá bài chung thứ năm
            communityCards.push(deck.shift());
            break;
        default:
            console.log("All cards have been dealt.");
            return;
    }

    phase++;
    updateDisplay();

    // Khi có ít nhất 5 lá trên bàn + 2 lá trên tay
    if (communityCards.length >= 3) {
        calculateWinRate();
    }
}


function updateDisplay() {
    document.getElementById("player-hand").innerHTML = playerHand.map(card => `<div class='card'>${card.value}${card.suit}</div>`).join('');
    document.getElementById("ai-hand").innerHTML = aiHand.map(card => `<div class='card'>${card.value}${card.suit}</div>`).join('');
    document.getElementById("community-cards").innerHTML = communityCards.map(card => `<div class='card'>${card.value}${card.suit}</div>`).join('');
}

function restartGame() {
    createDeck();
    playerHand = [];
    aiHand = [];
    communityCards = [];
    phase = 0;
    document.getElementById("win-rate").innerText = "Win Rate: 0%";
    document.getElementById("best-hand").innerText = "";
    document.getElementById("result").innerText = "";
    updateDisplay();
    dealCards();
}
createDeck();

function getCardValues(cards) {

    const cardRankings = { "J": 11, "Q": 12, "K": 13, "A": 14 };

    return cards.map(card =>
        cardRankings[card.value] || Number(card.value) || 0
    );
}
function hasPair(cards) {
    let values = getCardValues(cards);
    let counts = {};

    for (let val of values) {
        counts[val] = (counts[val] || 0) + 1;
        if (counts[val] === 2) return true; // Nếu tìm thấy cặp thì dừng ngay
    }
    return false;
}

function hasTwoPair(cards) {
    let values = getCardValues(cards);
    let counts = values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    return Object.values(counts).filter(count => count === 2).length === 2;
}

function hasThreeOfAKind(cards) {
    let values = getCardValues(cards);
    let counts = values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    return Object.values(counts).includes(3);
}

function hasFlush(cards) {
    let suitCounts = cards.reduce((acc, card) => {
        acc[card.suit] = (acc[card.suit] || 0) + 1;
        return acc;
    }, {});
    return Object.values(suitCounts).some(count => count >= 5);
}

function hasStraight(cards) {
    let valuesMap = {
        '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8,
        '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14
    };

    // Chuyển đổi giá trị quân bài sang số
    let values = cards.map(card => valuesMap[card.value]);

    // Loại bỏ trùng lặp và sắp xếp tăng dần
    values = [...new Set(values)].sort((a, b) => a - b);

    // Xử lý trường hợp sảnh A-2-3-4-5
    if (values.includes(14)) values.unshift(1);

    // Kiểm tra dãy 5 số liên tiếp
    for (let i = 0; i <= values.length - 5; i++) {
        if (values[i + 4] - values[i] === 4 &&
            values[i + 1] - values[i] === 1 &&
            values[i + 2] - values[i + 1] === 1 &&
            values[i + 3] - values[i + 2] === 1) {
            return true;
        }
    }
    return false;
}

function hasFullHouse(cards) {
    let values = getCardValues(cards);
    let counts = values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});

    let threeOfKind = Object.values(counts).includes(3);  // Có bộ ba
    let pair = Object.values(counts).includes(2);         // Có bộ đôi

    return threeOfKind && pair;  // Full House = 1 bộ ba + 1 bộ đôi
}

function hasFourOfAKind(cards) {
    let values = getCardValues(cards);
    let counts = values.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
    }, {});
    return Object.values(counts).includes(4);
}

function hasStraightFlush(cards) {
    return hasFlush(cards) && hasStraight(cards);
}

function getHighCard(cards) {
    return cards.sort((a, b) => getCardValue(b) - getCardValue(a)).slice(0, 5);
}


function getOnePair(cards) {
    let values = getCardValues(cards);
    let pairValue = values.find(val => values.filter(v => v === val).length === 2);
    let pairCards = cards.filter(c => getCardValue(c) === pairValue).slice(0, 2);
    let kickers = cards.filter(c => getCardValue(c) !== pairValue)
        .sort((a, b) => getCardValue(b) - getCardValue(a))
        .slice(0, 3);  // Lấy 3 lá cao nhất
    return [...pairCards, ...kickers];
}

function getTwoPair(cards) {
    let values = getCardValues(cards);
    let pairs = [...new Set(values.filter(val => values.filter(v => v === val).length === 2))].sort((a, b) => b - a);

    if (pairs.length < 2) return null; // Không có đủ 2 đôi

    let pair1Cards = cards.filter(c => getCardValue(c) === pairs[0]).slice(0, 2);
    let pair2Cards = cards.filter(c => getCardValue(c) === pairs[1]).slice(0, 2);

    let kicker = cards.filter(c => getCardValue(c) !== pairs[0] && getCardValue(c) !== pairs[1])
        .sort((a, b) => getCardValue(b) - getCardValue(a))[0]; // Lấy lá cao nhất

    return [...pair1Cards, ...pair2Cards, kicker];
}

function getThreeOfAKind(cards) {
    let values = getCardValues(cards);
    let threeValue = values.find(val => values.filter(v => v === val).length === 3);
    let threeCards = cards.filter(c => getCardValue(c) === threeValue).slice(0, 3);
    let kickers = cards.filter(c => getCardValue(c) !== threeValue)
        .sort((a, b) => getCardValue(b) - getCardValue(a))
        .slice(0, 2);  // Lấy 2 lá cao nhất
    return [...threeCards, ...kickers];
}

function getStraight(cards) {
    let values = [...new Set(getCardValues(cards))].sort((a, b) => b - a);
    for (let i = 0; i <= values.length - 5; i++) {
        if (values[i] - values[i + 4] === 4) {
            let straightValues = values.slice(i, i + 5);
            return cards.filter(c => straightValues.includes(getCardValue(c))).slice(0, 5);
        }
    }
    return [];
}

function getFlush(cards) {
    let flushSuit = cards.find(c => cards.filter(cc => cc.suit === c.suit).length >= 5).suit;
    return cards.filter(c => c.suit === flushSuit).slice(0, 5);
}

function getFullHouse(cards) {
    let threeCards = getThreeOfAKind(cards);
    let remainingCards = cards.filter(c => !threeCards.includes(c));
    let pairCards = getOnePair(remainingCards);
    return [...threeCards.slice(0, 3), ...pairCards.slice(0, 2)];
}

function getFourOfAKind(cards) {
    let values = getCardValues(cards);
    let fourValue = values.find(val => values.filter(v => v === val).length === 4);
    let fourCards = cards.filter(c => getCardValue(c) === fourValue).slice(0, 4);
    let kicker = cards.filter(c => getCardValue(c) !== fourValue)
        .sort((a, b) => getCardValue(b) - getCardValue(a))[0];  // Lấy 1 lá cao nhất
    return [...fourCards, kicker];
}

function getStraightFlush(cards) {
    return getStraight(cards).filter(c => isSameSuit(cards, c.suit));
}

function evaluateHand(cards) {
    if (hasStraightFlush(cards)) return { rank: 8, name: "Straight Flush" };
    if (hasFourOfAKind(cards)) return { rank: 7, name: "Four of a Kind" };
    if (hasFullHouse(cards)) return { rank: 6, name: "Full House" };
    if (hasFlush(cards)) return { rank: 5, name: "Flush" };
    if (hasStraight(cards)) return { rank: 4, name: "Straight" };
    if (hasThreeOfAKind(cards)) return { rank: 3, name: "Three of a Kind" };
    if (hasTwoPair(cards)) return { rank: 2, name: "Two Pair" };
    if (hasPair(cards)) return { rank: 1, name: "One Pair" };
    return { rank: 0, name: "High Card" };
}
function getCardValue(card) {
    let rank = card.value; // Giả sử card có thuộc tính rank: "A", "K", "Q", ..., "2"
    const values = {
        "A": 14, // Ace có giá trị cao nhất
        "K": 13,
        "Q": 12,
        "J": 11,
        "10": 10,
        "9": 9,
        "8": 8,
        "7": 7,
        "6": 6,
        "5": 5,
        "4": 4,
        "3": 3,
        "2": 2
    };

    return values[rank] || parseInt(rank); // Trả về số nếu không phải J, Q, K, A
}

function getBestHand(cards) {
    // Sắp xếp bài theo giá trị từ cao xuống thấp
    cards.sort((a, b) => getCardValue(b) - getCardValue(a));

    // Kiểm tra từng bộ từ mạnh đến yếu
    if (hasStraightFlush(cards)) return getStraightFlush(cards);
    if (hasFourOfAKind(cards)) return getFourOfAKind(cards);
    if (hasFullHouse(cards)) return getFullHouse(cards);
    if (hasFlush(cards)) return getFlush(cards);
    if (hasStraight(cards)) return getStraight(cards);
    if (hasThreeOfAKind(cards)) return getThreeOfAKind(cards);
    if (hasTwoPair(cards)) return getTwoPair(cards);
    if (hasPair(cards)) return getOnePair(cards);
    return getHighCard(cards); // Nếu không có gì thì lấy bài cao nhất
}

function compareHands(hand1, hand2) {
    for (let i = 0; i < 5; i++) {
        let value1 = getCardValue(hand1[i]);
        let value2 = getCardValue(hand2[i]);

        if (value1 > value2) return 1;  // hand1 thắng
        if (value1 < value2) return -1; // hand2 thắng
    }
    return 0; // Hòa
}

function calculateWinRate() {
    var playerBestHand = [...playerHand, ...communityCards];
    const aiBestHand = [...aiHand, ...communityCards];

    var playerRank = evaluateHand(playerBestHand);
    var aiRank = evaluateHand(aiBestHand);

    console.log("player best hand := " + getBestHand(playerBestHand).map(card => card.value + card.suit).join(", "));
    console.log("ai best hand := " + getBestHand(aiBestHand).map(card => card.value + card.suit).join(", "));

    let winRate = 50;
    let resultText = "";

    if (playerRank.rank > aiRank.rank) {
        winRate = 100;
        resultText = `You Win with ${playerRank.name}!`;
    } else if (playerRank.rank < aiRank.rank) {
        winRate = 0;
        resultText = `AI Wins with ${aiRank.name}!`;
    } else {
        const compareResult = compareHands(getBestHand(playerBestHand), getBestHand(aiBestHand));
        if (compareResult === 0) {
            winRate = 50;
            resultText = "Tie";
        } else if (compareResult === 1) {
            winRate = 100;
            resultText = `You Win with Higher ${playerRank.name}!`;
        } else if (compareResult === -1) {
            winRate = 0;
            resultText = `AI Wins with Higher ${aiRank.name}!`;
        }
    }
    document.getElementById("win-rate").innerText = `Win Rate Now: ${winRate}%`;
    document.getElementById("best-hand").innerText = `Your Best Hand: ${playerRank.name}:= ${getBestHand(playerBestHand).map(card => card.value + card.suit).join(", ")}
              AI Best Hand: ${aiRank.name}:= ${getBestHand(aiBestHand).map(card => card.value + card.suit)}`;
    document.getElementById("result").innerText = resultText;
}
