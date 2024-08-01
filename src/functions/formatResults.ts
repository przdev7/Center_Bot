const pb = {
  le: "<:le:1254827229590847518>",
  me: "<:me:1254827251183124683>",
  re: "<:re:1254827271793938522>",
  lf: "<:lf:1254827298780221500>",
  mf: "<:mf:1254827308598956143>",
  rf: "<:rf:1254827318292123738>",
};

function formatResults(upvotes: string[] = [], downvotes: string[] = []): string {
  const totalVotes: number = upvotes.length + downvotes.length;
  const progressBarLength = 14;
  const filledSquares: number = Math.round((upvotes.length / totalVotes) * progressBarLength) || 0;
  let emptySquares: number = progressBarLength - filledSquares || 0;

  if (!filledSquares && !emptySquares) {
    emptySquares = progressBarLength;
  }

  const upPercentage: number = (upvotes.length / totalVotes) * 100 || 0;
  const downPercentage: number = (downvotes.length / totalVotes) * 100 || 0;

  const progressBar: string =
    (filledSquares ? pb.lf : pb.le) +
    (pb.mf.repeat(filledSquares) + pb.me.repeat(emptySquares)) +
    (filledSquares === progressBarLength ? pb.rf : pb.re);

  const results = [];
  results.push(
    `👍 ${upvotes.length} upvotes (${upPercentage.toFixed(1)}%) • 👎 ${
      downvotes.length
    } downvotes (${downPercentage.toFixed(1)}%)`,
  );
  results.push(progressBar);

  return results.join("\n");
}

export default formatResults;
