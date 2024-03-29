const sequelize = require("../config/connection.js");
const { User, Club, Competition } = require("../models");

const seedMe = async () => {
  await sequelize.sync({ force: true });
  const userData = [
    {
      email: "rahul@rahul.com",
      password: "password",
    },
    {
      email: "renato@renato.com",
      password: "password",
    },
    {
      email: "spencer@spencer.com",
      password: "password",
    },
  ];
  const userSeeds = await User.bulkCreate(userData, {
    individualHooks: true,
  });
  console.table(userSeeds.map((usr) => usr.toJSON()));
  console.log("==============================");
  try {
    const response = await fetch(
      "https://api.football-data.org/v4/competitions/",
      {
        headers: {
          "X-Auth-Token": process.env.API_KEY,
        },
      }
    );
    const { competitions } = await response.json();

    const competitionsData = competitions.map((competition) => ({
      apiCompetitionId: competition.id,
      apiCompetitionName: competition.name,
    }));

    const competitionSeeds = await Competition.bulkCreate(competitionsData);
    console.table(competitionSeeds.map((comp) => comp.toJSON()));
  } catch (error) {
    console.log("Error seeding competitions:", error);
    throw error;
  }
  console.log("==============================");
  const clubData = [
    {
      apiClubId: 61,
      apiClubName: "Chelsea FC",
      UserId: 1,
      apiCompetitionId: 2021
    },
    {
      apiClubId: 563,
      apiClubName: "West Ham United FC",
      UserId: 1,
      apiCompetitionId: 2021
    },
    {
      apiClubId: 65,
      apiClubName: "Manchester City FC",
      UserId: 2,
      apiCompetitionId: 2021
    },
    {
      apiClubId: 76,
      apiClubName: "Wolverhampton Wanderers FC",
      UserId: 3,
      apiCompetitionId: 2021
    },
  ];
  const clubSeeds = await Club.bulkCreate(clubData);
  console.table(clubSeeds.map((club) => club.toJSON()));


  process.exit(0);
};

seedMe();
