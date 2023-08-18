//server
const http = require("http");
const socketIO = require("socket.io");
const { PriorityQueue } = require("@datastructures-js/priority-queue");
const express = require("express");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

const port = 3000; // Port number that server listens for incoming connection

//initialize socket.io and passing http server as argument to socketIO
//which gives io instant which can be used to listen for incoming socket connection and events
const ioserver = socketIO(server, {
  cors: {
    origin: "*",
  },
});

const pq = new PriorityQueue((a, b) => {
  if (a.amount > b.amount) {
    return -1;
  }
  if (a.amount < b.amount) {
    return 1;
  }
});

const loginDetails = [
  { email: "ok@gmail.com", password: "ok" },
  { email: "mp@gmail.com", password: "ok2" },
];

app.use(cors());
app.use(express.json());

//handles login
app.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const user = loginDetails.find(
      (u) => u.email === email && u.password === password
    );

    if (user) {
      return res.status(200).json({ passed: true });
    } else {
      return res.status(401).json({ passed: false });
    }
  } catch (ex) {
    console.warn(ex);
  }
});

const fundsData = [
  {
    id: 0,
    name: "Mary Kate Scott",
    story:
      "Hi, it's Randy Lary - we are looking to raise $10,000 to stock Brook Trout in Great Moose Lake. If we get more than this amount we will buy more trout. The fish will cost $6-8 each, depending on size. Thanks - Randy.",
    beneficiaryName: "Randy Lary",
    place: "Pittsfield, ME",
    title: "Fish Stocking for Great Moose Lake Maine",
    img: "/lakemaine.jpg",
    created_at: "10 Aug 2023",
    goal: 10000,
    donation_num: 4,
    total_donation: 2433,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "Josh Lee",
        amount: 2300,
      },
      {
        donator: "Jessy Well",
        amount: 78,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 40,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 15,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Josh Lee",
        amount: 2300,
      },
      {
        donator: "Jessy Well",
        amount: 78,
      },
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
  },
  {
    id: 1,
    name: "Gwen Leite",
    story:
      "Aloha, we are Gwen and Christian the owners of Moana Lani Bed and Breakfast.Over the last 5 years we have hosted many wonderful people in our home. Some came for their honeymoon, some for an anniversary, some people came to relax and some were looking for adventure. Whatever the reason, Moana Lani was a home away from home for travelers seeking to enjoy the beauty of Maui. During the wildfires that have recently affected Maui, our beloved home was totally destroyed. The fires consumed everything in its path including Moana Lani. Like so many others affected by the fires, we are completely heartbroken. We have had many of our wonderful guests reach out to us in an outpouring of love and support, many asking how they can help. We decided to start this fund as a way to help us move forward. We will rebuild our Bed and Breakfast and one day be able to host amazing people from all over the world once again. \n\nMahalo nui loa, a hui hou.",
    beneficiaryName: "Gwen and Christian",
    place: "Lahaina, HI",
    title: "Rebuild Moana Lani",
    img: "/aloha2.jpg",
    created_at: "11 Aug 2023",
    goal: 10000,
    donation_num: 4,
    total_donation: 723,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 400,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 78,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 400,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 15,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "James Rin",
        amount: 400,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 78,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
  },
  {
    id: 2,
    name: "James LLC.",
    story:
      "An urgent message to artists and music lovers:\n\nRockwood Music Hall needs your help:\n\nOver the past 18 years, Rockwood has hosted over 75,000 shows on its three stages, helping to launch and develop the careers of thousands of artists. It has also been the site of hundreds of appearances by Grammy, Tony, and American Music Award winners.\n\n But unless Rockwood receives immediate help, it is in danger of closing permanently.\nLike many small, independent music venues across the country, Rockwood is struggling to stay open. Without the support of artists, the music community and fans of music, Rockwood is in danger of permanently closing, shutting off a vital place for independent and up-and-coming musicians to develop their artistry and give fans the opportunity to discover new music in a live setting.\n\nWe can still save Rockwood!\nBy rallying together, we can help preserve Rockwood as a vital cultural institution, combat corporate influence on live music, and support the independent music scene in New York City.",
    beneficiaryName: "Rockwood Music Corp.",
    place: "New York, NY",
    title: "Preserve Rockwood",
    img: "/music.webp",
    created_at: "9 Aug 2023",
    goal: 10000,
    donation_num: 4,
    total_donation: 853,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 10,
      },
      {
        donator: "Josh Lee",
        amount: 30,
      },
      {
        donator: "Jessy Well",
        amount: 798,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 10,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 30,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 15,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Jessy Well",
        amount: 798,
      },
      {
        donator: "Josh Lee",
        amount: 30,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
      {
        donator: "James Rin",
        amount: 10,
      },
    ],
  },
  {
    id: 3,
    name: "HorizonAid Foundation",
    story:
      "We lost our business last tuesday in the fire that destroyed lahaina town. Our food truck is completely destroyed, any help will be welcome to start our business again.\n\nPerdimos nuestro negocion el pasado martes en el fuego que destruyo lahaina town. Nuestra food truck esta completamente destruida, cualquier ayuda sera bien recibida para volver a iniciar nuestro negocio de nuevo.",
    beneficiaryName: "Veronica Telleznunez",
    place: "Lahaina, HI",
    title: "We lost our business in the lahaina fire",
    img: "/jar2.jpg",
    created_at: "23 July 2023",
    goal: 50000,
    donation_num: 3,
    total_donation: 8200,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 4000,
      },
      {
        donator: "Josh Lee",
        amount: 2500,
      },
      {
        donator: "MR. X",
        amount: 1700,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 4000,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 2500,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 1700,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "James Rin",
        amount: 4000,
      },
      {
        donator: "Josh Lee",
        amount: 2500,
      },
      {
        donator: "MR. X",
        amount: 1700,
      },
    ],
  },
  {
    id: 4,
    name: "StarGlobe Outreach",
    story:
      "Aloha, Friends, I'm reaching out with a heart full of sadness, gratitude, and hope. This month began with an excellent start as my business and brand was voted #1 Place to Receive a Massage on Maui. It is a great honor. Unfortunately, on the late afternoon of Tuesday, August 8, 2023, my 2nd massage business location, “Maui’s Best Massage - Lahaina,” was engulfed by the devastating fires that destroyed Lahaina town. There is nothing left but rubble and ash. \nMy crew and I are left in a state of shock and sorrow, still not quite believing the utter destruction the fires wrought. Thankfully, all of our Staff are safe.\n\nThe funds we are seeking will be used with the utmost care and thoughtfulness:\n1. Recoup losses of space, supplies, and materials.\n\n2. Create a monetary “buffer” when we will have to semi-close our Kihei location for the inevitable construction. We are expecting an 80-90% reduction in revenue during this closure; a loss that would have been mitigated by directing our clients to our Lahaina location.\n\nAny assistance is gratefully appreciated at this time.\n\nMahalo, Sam Molitas\n\nOwner\nMaui’s Best Massage - Lahaina",
    beneficiaryName: "Sophia Johnson",
    place: "Lahaina, HI",
    title: "Rebuilding a Dream:From Ashes to Healing Hands",
    img: "/heart.png",
    created_at: "25 July 2023",
    goal: 5000,
    donation_num: 4,
    total_donation: 1513,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 450,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 708,
      },
      {
        donator: "MR. X",
        amount: 125,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 450,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 125,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Jessy Well",
        amount: 708,
      },
      {
        donator: "James Rin",
        amount: 450,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "MR. X",
        amount: 125,
      },
    ],
  },
  {
    id: 5,
    name: "EmpowerU Foundation",
    story:
      "We've certainly faced challenges, it's what farming is about - problem solving, adapting, and persevering to bring a crop to harvest. The weather is unpredictable, with extreme weather events occurring more often farming is becoming increasingly difficult, whether it be prolonged drought, excessive rain, or extreme temperature fluctuations - milder winters usher in earlier growth stages putting the bushes in danger of critical temperatures. Unfortunately, a loss of this magnitude cannot be overcome without financial help. We have invested almost an entire year of work to make this year's harvest possible, with another year of work yet to be done to ensure the health of the bushes for the possibility of a bountiful crop next year.\n\nWith your help, the funds donated will be used not only to sustain daily farm operations but will also help support our efforts of investing in frost/freeze protection equipment.\n\nGrowing blueberries is our life, we look forward to every stage of the plant's development, but especially the bounty of the harvest - a time when we get to share the fruits of our labor with the community and contribute to the important local food supply. Please consider contributing to help the farm persevere through this unprecedented farm season, thank you.",
    beneficiaryName: "Noah Rodriguez",
    place: "Tremont, IL",
    title: "Help Fund Noah's River Valley Farm",
    img: "/lakemaine.jpg",
    created_at: "20 May 2023",
    goal: 25000,
    donation_num: 4,
    total_donation: 365,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 80,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 40,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 15,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 80,
      },
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
  },
  {
    id: 6,
    name: "HopeWings Alliance",
    story:
      "Expansion Goals:\nThe funds raised through this campaign will be used to support our expansion efforts and address these pressing challenges. Specifically, the funds will be allocated towards:\n\n1. Kitchen Expansion: We urgently need to expand our facility to create more space for storage, food preparation, and cooking.\n\n2. Upgrade Equipment: Our current equipment is grossly outdated and burning out fast from near constant use, cooking almost everything on just two portable induction burners.\n\n3. Give a Meal/Take a Meal: We are passionate about supporting those in need, with an expanded facility we will finally be able to fully establish our Give a Meal/Take a Meal program; providing meals to low-income individuals and those experiencing crisis in our community without having to order ahead OR pay.\n\n4. Payroll & Taxes: While renovating our facility there will be temporary disruptions that may impact our cashflow. The funds raised will help ensure the stability of our payroll and tax obligations during this crucial period.\n\n5. Advertising: With an expanded facility and ability to create more, we will need to advertise our services more effectively, reaching a wider audience and attracting new customers.",
    beneficiaryName: "Isabella Khan",
    place: "Seattle, WA",
    title: "Serving Success! Empower the Supper Club's growth!",
    img: "/supper.jpg",
    created_at: "1 Aug 2023",
    goal: 20000,
    donation_num: 4,
    total_donation: 4800,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 3000,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 70,
      },
      {
        donator: "MR. X",
        amount: 1500,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 3000,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 1500,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "James Rin",
        amount: 3000,
      },
      {
        donator: "MR. X",
        amount: 1500,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 70,
      },
    ],
  },
  {
    id: 7,
    name: "Dan Vado",
    story:
      "Art Boutiki is a San Jose live music space that is housed in a 100-plus-year-old building. This summer some of the cracks started to show in a way that we can't just toss some paint over it and smile. Among the big things that need to be addressed is the air conditioning. We are responsible for maintaining our HVAC unit and while it is NOT as old as the building, it was not really meant to be used as much as we use it. We have been putting bandaids on it for the past few years, but now we want to try and overhaul the system.\n\nThere are a few other minor things that need to get addressed, we need to fix a freezer, repair the front door (which is 100 years old and gets a lot more use than it was intended for) and deal with some restroom issues, all under the hood kind of stuff you would not see much of.\nNot to mention we are still dealing with some covid era bills that need attention.\n\nSo, if you are a Patreon Patron already, thanks very much for that. If you come to shows here on the regular, thanks SO much for that. If you feel like tossing a little extra our way to get by issues that cannot be dealt with from normal revenue streams, well this is the place for you.",
    beneficiaryName: "Dan Vado",
    place: "Austin, TX",
    title: "Help Keep Art Boutiki Cool",
    img: "/music2.jpg",
    created_at: "20 May 2023",
    goal: 250000,
    donation_num: 4,
    total_donation: 42780,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 4000,
      },
      {
        donator: "Josh Lee",
        amount: 23000,
      },
      {
        donator: "Jessy Well",
        amount: 780,
      },
      {
        donator: "MR. X",
        amount: 15000,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 4000,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 23000,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 15000,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Josh Lee",
        amount: 23000,
      },
      {
        donator: "MR. X",
        amount: 15000,
      },
      {
        donator: "James Rin",
        amount: 4000,
      },
      {
        donator: "Jessy Well",
        amount: 780,
      },
    ],
  },
  {
    id: 8,
    name: "Harmony Haven Association",
    story:
      "Hello all, my name is Beth Walker and I am Fundraising for our little farm and bakery in Bethel, Maine. \nLaFerme is a small farm with a menagerie of rescue animals as well as a bakery/farm stand servicing the local community and beyond. Our baked goods and bagels have traveled to Washington DC, California and even been to West Point Military Academy.\n\nHaving been brought up in a small town in Maine, only an hour from Bethel, I know how important small local businesses are.\n\nIn the midst of COVID, when we didn’t have anything else to lose, we gave this idea a go, with our former success in town with The Hitching Post…our beloved Diner, we thought and hoped we’d have another successful opportunity to serve our community heartfelt food! Since it’s inception we’ve given back to our community and helped in any way we could! And though I’ve gone back and forth over the idea of ask for help, in this moment, I have no choice! I’ve got to!\n\nOur business has seen two major set backs.\nOur beloved and well used mixer has broken a major part and we’re currently limping her along to get through. The mixer could totally shut down and we’d be up a creek with no paddle!\nSecound is our refrigeration…we bought a second hand cooler and that froze all of the produce inside and immediately shut off. We are out a very large produce order, the cost of the fridge and now the new purchase of another refrigerator.\nBoth of these items are integral parts in our daily operations! Without them we are at a major loss.\n\nShould you feel the pull to donate, know that LaFerme has been a dream of mine for as long as I could remember. So much of it is getting to share it with the people that visit us! Many mouths have been fed, families cooked and cared for and Friends that became family through food. Im so proud of what we’ve accomplished and what we’ve gotten to share with you thus far, and we want so much to continue to build our property and business with an inclusive mentality for the future, we love watching people experience our little piece of Heaven.\n\nWe ask for your support with the upmost humility….we promise to pay it forward!\nLaFerme Salted Chocolate Chip Cookies for the masses!",
    beneficiaryName: "Beth Walker",
    place: "Denver, CO",
    title: "LaFerme needs your help!",
    img: "/plant.jpg",
    created_at: "20 May 2023",
    goal: 10000,
    donation_num: 4,
    total_donation: 150,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 20,
      },
      {
        donator: "Josh Lee",
        amount: 50,
      },
      {
        donator: "Jessy Well",
        amount: 70,
      },
      {
        donator: "MR. X",
        amount: 10,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 20,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 50,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 10,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Jessy Well",
        amount: 70,
      },
      {
        donator: "Josh Lee",
        amount: 50,
      },
      {
        donator: "James Rin",
        amount: 20,
      },
      {
        donator: "MR. X",
        amount: 10,
      },
    ],
  },
  {
    id: 9,
    name: "Will Moran",
    story:
      "Let's help out Snow Ridge Ski Resort after a recent tornado caused some damage to the hill and operations.\n\nIf you have ever been lucky enough to score a POW day here, you know how awesome this place is! Let's rally and help them get straightened out before the winter season arrives so we can all get those sweet turns in.\n\nPlease consider reaching out to everyone else in the Turin and surrounding community to offer support!\n\n100% of donations will be transferred to Snow Ridge by 8/17/23\n\nFeel free to share this!",
    beneficiaryName: "Aiden Brown",
    place: "San Francisco, CA",
    title: "Support - Snow Ridge Ski Resort",
    img: "/snow.jpg",
    created_at: "12 Aug 2023",
    goal: 25000,
    donation_num: 4,
    total_donation: 1540,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 400,
      },
      {
        donator: "Josh Lee",
        amount: 200,
      },
      {
        donator: "Jessy Well",
        amount: 790,
      },
      {
        donator: "MR. X",
        amount: 150,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 400,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 200,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 150,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Jessy Well",
        amount: 790,
      },
      {
        donator: "James Rin",
        amount: 400,
      },
      {
        donator: "Josh Lee",
        amount: 200,
      },
      {
        donator: "MR. X",
        amount: 150,
      },
    ],
  },
  {
    id: 10,
    name: "Radiant Futures Network",
    story:
      "DCC has kept people working for six months hoping for an end to the strike sooner rather than later. Well this hasn't happened and there's nothing left to give. We are trying to simply keep the light on at this point so there is a place to come back to when this all ends.\n\nThe Carrot needs your help. As of today, Dangling Carrot Creative is Dangling on the precipice of extinction. The movie industry strike has made DCC on the verge of unsurmountable growing debt with little income, big bills, and no end in sight.\n\nWe are asking anyone that has the means to help to do so. In return, ALL donations to help get us through this, will be returned in FULL to a charity of the donors choice. This will happen relatively quickly once this challenging time ends.\n\nPlease list the charity along with your donation when sent and when we're through this, we will put it in your name and send off to the charity and send you the confirmation of the gift to them.\n\nThank you one and all in advance for helping save what's been built to serve the industry for years and hopefully for years to come..........",
    beneficiaryName: "Emma Lee",
    place: "Boston, MA",
    title: "Help Save the Carrot!",
    img: "/crowdfunding.jpg",
    created_at: "9 Aug 2023",
    goal: 1000,
    donation_num: 4,
    total_donation: 355,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 70,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 40,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 15,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 70,
      },
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "MR. X",
        amount: 15,
      },
    ],
  },
  {
    id: 11,
    name: "HorizonAid Foundation",
    story:
      "Dear friends, patrons, musicians, enjoyers of art, food, and most of all family,\nWe took over the Stone Church just less than a year ago from the capable hands of Mike and Cheryl Hoffman. It's been a blessing to inherit such a wonderful town staple that has had a long tradition of bringing people together for music, family, and celebration. We are asking for your help to keep this venue alive for years to come. We have experienced a string of unexpected costs during our first year that have put us at risk. To name just a few, we’ve had to replace our central sound board, our industrial side door, necessary office equipment, and much more. All of that coupled with the rising cost of operating a multi-tiered music venue and restaurant, as well as providing our staff and musicians a livable wage. We are asking for a generous contribution, either small or large, to keep this community staple of 54 years going strong. We thank you for all of your support, and are hoping to keep this long strange trip going!\nMuch love,\nThe Stone Church",
    beneficiaryName: "Jackson Bennett",
    place: "Seattle, WA",
    title: "Keep The Stone Church Alive for another 50 Yrs",
    img: "/church.jpg",
    created_at: "20 July 2023",
    goal: 25000,
    donation_num: 4,
    total_donation: 2300,
    recentDonators: [
      {
        donator: "James Rin",
        amount: 40,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "Jessy Well",
        amount: 780,
      },
      {
        donator: "MR. X",
        amount: 1250,
      },
    ],
    comments: [
      {
        donator: "James Rin",
        amount: 40,
        comment:
          "So tragic to see what has happened. In a time where so much divides us we need more unity and togetherness.",
      },
      {
        donator: "Josh Lee",
        amount: 230,
        comment: "with love and solidarity from chicago diy",
      },
      {
        donator: "MR. X",
        amount: 1250,
        comment:
          "In the face of this tragedy, may we find strength in our shared humanity and come together for a better future.",
      },
    ],
    leaderboard: [
      {
        donator: "MR. X",
        amount: 1250,
      },
      {
        donator: "Jessy Well",
        amount: 780,
      },
      {
        donator: "Josh Lee",
        amount: 230,
      },
      {
        donator: "James Rin",
        amount: 40,
      },
    ],
  },
];

// waits for 1 sec and then resolves promise (for orderly events)
function returnsPromise() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}

// this starts when client is connected to server
ioserver.on("connection", (socket) => {
  console.log(
    "Client [",
    socket.request.connection.remoteAddress,
    "] is authenticated and connected."
  );

  // occurs before every event change on client (website) (for orderly events)
  socket.on("event", async () => {
    await returnsPromise();
  });

  // listens for any donations by clients and then stores them
  socket.on("donate", (donationData) => {
    console.log(
      "Client [",
      socket.request.connection.remoteAddress,
      "] donated $",
      donationData.amount,
      "to",
      fundsData[donationData.index].name
    );

    //adding to total amount
    fundsData[donationData.index].total_donation += donationData.amount;

    //adding to donations count
    fundsData[donationData.index].donation_num += 1;

    //pushing to recent donations
    fundsData[donationData.index].recentDonators.unshift({
      donator: donationData.donator,
      amount: donationData.amount,
    });

    //pushing to leaderboard (using priority queue)
    fundsData[donationData.index].recentDonators.forEach((d) => pq.enqueue(d));
    const l = [];
    while (!pq.isEmpty()) {
      l.push(pq.dequeue());
    }
    fundsData[donationData.index].leaderboard = [...l];

    if (donationData.comment.comment) {
      fundsData[donationData.index].comments.unshift(donationData.comment);
    }

    //broadcasts to every client
    ioserver.emit("donation", {
      socketId: socket.id,
      amount: donationData.amount,
      fundOrganizer: fundsData[donationData.index].name,
      donator: donationData.donator,
      index: donationData.index,
      fundsData: fundsData,
    });
  });

  // client asks for this data before it loads the website
  socket.on("fundsData request", () => {
    socket.emit("fundsData response", fundsData);
  });

  // client asks for this data before it loads the website
  socket.on("specific fund request", (index) => {
    socket.emit("specific fund response", fundsData[index]);
  });

  socket.on("quit", () => {
    socket.disconnect();
  });

  //Server listens for the disconnect event
  //when disconnects it closes tcp connection
  socket.on("disconnect", () => {
    console.log(
      "Client [",
      socket.request.connection.remoteAddress,
      "] just disconnected."
    );
  });
});

//this listener will console log when socket connection to client fails
ioserver.on("connect_failed", () =>
  console.log("Not able to connect to the client")
);

//starts the server that listen to a specified port
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
