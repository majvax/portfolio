export const heroTranslations = {
    fr: {
        title: "Guillaume Dehez",
        subtitle: "Étudiant ingénieur en cybersécurité & aspirant rétro-ingénieur",
        description:
            "Je suis un étudiant en première année d'ingénierie de 19 ans avec une passion pour le développement de logiciels et la cybersécurité. Je me spécialise en programmation C++ et vise à poursuivre une carrière en reverse engineering."
    },
    en: {
        title: "Guillaume Dehez",
        subtitle: "Cybersecurity engineering student & aspiring reverse engineer",
        description:
            "I'm an 19-year-old first-year engineering student with a passion for software development and cybersecurity. I'm majoring in C++ programming and aim to pursue a career in reverse engineering."
    }
} as const;


export const blogTranslations = {
    fr: {
        title: "Derniers articles",
        intro: "Bienvenue sur mon blog ! Ici, je partage mes réflexions et mes découvertes sur la programmation, la cybersécurité et d'autres sujets qui m'intéressent. J'espère que vous trouverez ces articles intéressants et utiles.",
        minRead: (m: number) => `${m} min de lecture`,
        backToBlog: "Retour au blog",
    },
    en: {
        title: "Latest posts",
        intro: "Welcome to my blog! Here, I share my thoughts and discoveries on programming, cybersecurity, and other topics that interest me. I hope you find these articles interesting and helpful.",
        minRead: (m: number) => `${m} min read`,
        backToBlog: "Back to blog",
    }
} as const;


export const seoTranslations = {
    en: {
        home: {
            title: "Guillaume Dehez - Portfolio",
            description: "Personal portfolio of Guillaume Dehez, a 19-year-old engineering student passionate about C++, reverse engineering, and cybersecurity.",
        },
        blog: {
            title: "Blog - Guillaume Dehez",
            description: "Articles on programming, cybersecurity, reverse engineering, and CTF writeups by Guillaume Dehez.",
        },
    },
    fr: {
        home: {
            title: "Guillaume Dehez - Portfolio",
            description: "Portfolio personnel de Guillaume Dehez, étudiant ingénieur de 19 ans passionné par le C++, la rétro-ingénierie et la cybersécurité.",
        },
        blog: {
            title: "Blog - Guillaume Dehez",
            description: "Articles sur la programmation, la cybersécurité, le reverse engineering et des writeups de CTF par Guillaume Dehez.",
        },
    },
} as const;
