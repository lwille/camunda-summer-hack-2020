import express from "express";

export default express()
  .get("/health", async (req, res) => res.json({ status: "UP" }))
