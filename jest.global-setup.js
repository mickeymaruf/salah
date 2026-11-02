// Prayer times are absolute instants and the tests compare them to local dates,
// so every run uses the same time zone.
module.exports = async () => {
  process.env.TZ = 'UTC';
};
