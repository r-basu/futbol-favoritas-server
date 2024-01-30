const express = require("express");
const router = express.Router();
const { Club, User, Competition } = require("../models");
const withTokenAuth = require("../middleware/withTokenAuth");

//Fetch Single Club based on URL Param ID
router.get("/club/:id", async (req, res) => {
  const clubId = req.params.id;

  try {
    const response = await fetch(
      `https://api.football-data.org/v4/teams/${clubId}`,
      {
        headers: {
          "X-Auth-Token": process.env.API_KEY, // Replace with your actual Football Data API key
        },
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.log("Error fetching club data:", error);
    res.status(500).send("Error fetching club data");
  }
});

//FETCH ALL Competitions
router.get("/competitions", async (req, res) => {
  try {
    const competitions = await Competition.findAll();
    res.json(competitions);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "an error occurred", err });
  }
});

// FETCH ALL Teams from SPECIFIC Competition
router.get("/competitionTeams/:id", (req, res) => {
  const competitionId = req.params.id;
  try {
    const url = `https://api.football-data.org/v4/competitions/${competitionId}/teams`;
    const fetchOptions = {
      method: "GET",
      headers: {
        "X-Auth-Token": process.env.API_KEY,
      },
    };
    fetch(url, fetchOptions)
      .then((response) => response.json())
      .then((apiCompetition) => {
        const { teams } = apiCompetition;
        const teamData = teams.map((team) => {
          squadData = team.squad.map((player) => {
            return {
              id: player.id,
              name: player.name,
            };
          });
          return {
            id: team.id,
            name: team.name,
            squadData,
          };
        });
        res.json(teamData);
      });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "an error occurred", err });
  }
});

// CREATE a pinned club
router.post("/dbClubs", withTokenAuth, async (req, res) => {
  try {
    const { selectedClubId, selectedClubName } = req.body;

    const newClub = await Club.create({
      apiClubId: selectedClubId,
      apiClubName: selectedClubName,
      UserId: req.tokenData.id,
    });
    res.status(201).json(newClub);
  } catch (error) {
    console.log("Error adding club:", error);
    res.status(500).json({ error: "Failed to create club" });
  }
});

// Fetch all saved apiClubId's matching userId in database
router.get("/pins", withTokenAuth, async (req, res) => {
  try {
    const userId = req.tokenData.id;

    const clubsData = await Club.findAll({
      where: { UserId: userId },
      attributes: ["apiClubId", "apiClubName"],
    });

    const apiClubs = clubsData.map((club) => ({
      dbClubId: club.apiClubId,
      dbClubName: club.apiClubName,
    }));

    res.status(201).json(apiClubs);
  } catch (error) {
    console.log("Error retrieving club ids", error);
    res.status(500).json({ error: "Error retrieving club ids" });
  }
});

module.exports = router;
