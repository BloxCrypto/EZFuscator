export interface ObfuscationResult {
  code: string;
  originalSize: number;
  obfuscatedSize: number;
}

const toByteString = (str: string, chunkSize: number = 120): string[] => {
  const bytes = str.split("").map((char) => char.charCodeAt(0));
  const chunks = [];
  for (let i = 0; i < bytes.length; i += chunkSize) {
    chunks.push(bytes.slice(i, i + chunkSize).join(", "));
  }
  return chunks;
};

const randomVarName = (length: number): string => {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  const hex = Math.floor(Math.random() * 0xffffff)
    .toString(16)
    .padStart(6, "0");
  return `_0x${result.slice(0, 4)}${hex}`;
};

export const obfuscateLua = (code: string): ObfuscationResult => {
  const byteChunks = toByteString(code);

  const aliasChar = randomVarName(8);
  const aliasLoad = randomVarName(8);
  const aliasData = randomVarName(10);
  const aliasFunc = randomVarName(9);
  const aliasParam = randomVarName(5);
  const junkVar = randomVarName(6);
  const aliasCat = randomVarName(7);

  const opaquePredicates = [
    "(math.pi > 3)",
    "(math.floor(1.5) == 1)",
    "(#_VERSION > 0)",
    "(2 + 2 == 4)",
  ];
  const selectedPredicate =
    opaquePredicates[
      Math.floor(Math.random() * opaquePredicates.length)
    ];

  // Build concatenation of byte chunks
  const chunkVars = byteChunks.map((_, i) => `${aliasData}${i}`);
  const chunkAssignments = byteChunks
    .map(
      (chunk, i) =>
        `local ${aliasData}${i} = ${aliasChar}(${chunk})`
    )
    .join("; ");
  const concatExpression = chunkVars.join(" .. ");

  const encoded = `local ${aliasChar}, ${aliasLoad}, ${aliasCat} = string.char, (loadstring or load), table.concat;
local ${junkVar} = function(...) return ... end;
if ${selectedPredicate} then
    ${chunkAssignments};
    local ${aliasData} = ${concatExpression};
    local ${aliasFunc} = function(${aliasParam})
        if ${junkVar}(true) then
            return ${aliasLoad}(${aliasParam})()
        end
    end;
    ${aliasFunc}(${aliasData});
end`;

  const minified = encoded
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join(" ");

  return {
    code: minified,
    originalSize: code.length,
    obfuscatedSize: minified.length,
  };
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Math.round((bytes / Math.pow(k, i)) * 100) / 100 +
    " " +
    sizes[i]
  );
};
