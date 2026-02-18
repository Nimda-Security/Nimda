import { TERMINAL_FS } from '../data/constants';

export const getHangulInitial = (str) => {
  const c = str.charCodeAt(0);
  if (c >= 0xAC00 && c <= 0xD7A3) {
    const initialOffset = Math.floor((c - 0xAC00) / 28 / 21);
    const initials = [
      "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ", "ㅅ", "ㅆ",
      "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"
    ];
    return initials[initialOffset] || "#";
  }
  return str[0].toUpperCase();
};

export function processCommand(cmd, cwd) {
  const trimmed = cmd.trim();
  if (!trimmed) return { output: "", newCwd: cwd };

  const parts = trimmed.split(/\s+/);
  const command = parts[0];
  const args = parts.slice(1);

  switch (command) {
    case "pwd":
      return { output: cwd, newCwd: cwd };

    case "ls": {
      const target = args[0] ? (args[0].startsWith("/") ? args[0] : `${cwd === "/" ? "" : cwd}/${args[0]}`) : cwd;
      const entries = TERMINAL_FS[target];
      if (entries) {
        return { output: entries.length > 0 ? entries.join("  ") : "", newCwd: cwd };
      }
      return { output: `ls: ${args[0] || target}: No such file or directory`, newCwd: cwd };
    }

    case "cd": {
      if (!args[0] || args[0] === "~") {
        return { output: "", newCwd: "/home/nimda" };
      }
      let target;
      if (args[0] === "..") {
        const parts2 = cwd.split("/").filter(Boolean);
        parts2.pop();
        target = "/" + parts2.join("/");
        if (!target || target === "/") target = "/";
      } else if (args[0].startsWith("/")) {
        target = args[0];
      } else {
        const potentialPath = `${cwd === "/" ? "" : cwd}/${args[0]}`;
        // Case-insensitive check
        const matchingKey = Object.keys(TERMINAL_FS).find(
          (k) => k.toLowerCase() === potentialPath.toLowerCase()
        );
        target = matchingKey || potentialPath;
      }
      if (TERMINAL_FS[target] !== undefined) {
        return { output: "", newCwd: target };
      }
      return { output: `cd: no such file or directory: ${args[0]}`, newCwd: cwd };
    }

    case "whoami":
      return { output: "nimda", newCwd: cwd };

    case "hostname":
      return { output: "nimda-macbook.local", newCwd: cwd };

    case "date": {
      const now = new Date();
      return { output: now.toString(), newCwd: cwd };
    }

    case "echo":
      return { output: args.join(" "), newCwd: cwd };

    case "cat": {
      if (!args[0]) return { output: "cat: missing operand", newCwd: cwd };
      if (args[0] === "님다소개.txt" || args[0] === "/home/nimda/Desktop/님다소개.txt") {
        return { output: "NIMDA 정보보안 동아리\n웹 개발과 정보보안을 함께 공부하는 동아리입니다.\n📍 위치: 학생회관 3층 305호\n📧 이메일: amazingnimda@gmail.com", newCwd: cwd };
      }
      return { output: `cat: ${args[0]}: No such file or directory`, newCwd: cwd };
    }

    case "uname":
      return { output: args.includes("-a") ? "NIMDA-OS nimda-macbook.local 1.0.0 NIMDA-OS x86_64" : "NIMDA-OS", newCwd: cwd };

    case "clear":
      return { output: "__CLEAR__", newCwd: cwd };

    case "help":
      return {
        output: "사용 가능한 명령어:\n  pwd       - 현재 디렉토리 출력\n  ls        - 파일 목록 출력\n  cd <dir>  - 디렉토리 이동\n  cat <file>- 파일 내용 출력\n  whoami    - 사용자 이름 출력\n  hostname  - 호스트 이름 출력\n  date      - 현재 날짜/시간 출력\n  echo      - 텍스트 출력\n  uname     - 시스템 정보 출력\n  clear     - 화면 지우기\n  help      - 명령어 목록 출력",
        newCwd: cwd,
      };

    default:
      return { output: `zsh: command not found: ${command}`, newCwd: cwd };
  }
}
