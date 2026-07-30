export const DISEASE_LABEL_NAMES = {
  en: {
    "corn (maize)": { healthy: "Healthy", cercospora_leaf_spot_gray_leaf_spot: "Cercospora Leaf Spot / Gray Leaf Spot", common_rust: "Common Rust", northern_leaf_blight: "Northern Leaf Blight" },
    potato: { healthy: "Healthy", early_blight: "Early Blight", late_blight: "Late Blight" },
    bean: { healthy: "Healthy", other_disease: "Other Disease", rust: "Rust" },
  },
  rw: {
    "corn (maize)": { healthy: "Nziza", cercospora_leaf_spot_gray_leaf_spot: "Ibarabara rya Cercospora / Ibarabara Ryijimye", common_rust: "Ruswa Risanzwe", northern_leaf_blight: "Uburwayi bw'Amababa" },
    potato: { healthy: "Nziza", early_blight: "Uburwayi Bw'ibara", late_blight: "Uburwayi Bukomeye" },
    bean: { healthy: "Nziza", other_disease: "Indwara Zindi", rust: "Ruswa" },
  },
  fr: {
    "corn (maize)": { healthy: "Saine", cercospora_leaf_spot_gray_leaf_spot: "Tache Cercosporéenne / Tache Grise", common_rust: "Rouille Commune", northern_leaf_blight: "Brûlure du Nord" },
    potato: { healthy: "Saine", early_blight: "Mildiou Précocce", late_blight: "Mildiou Tardif" },
    bean: { healthy: "Saine", other_disease: "Autre Maladie", rust: "Rouille" },
  },
  ar: {
    "corn (maize)": { healthy: "سليم", cercospora_leaf_spot_gray_leaf_spot: "تبقع السيركوسبورا / التبقع الرمادي", common_rust: "الصدأ الشائع", northern_leaf_blight: "لفحة الشمال" },
    potato: { healthy: "سليم", early_blight: "اللفحة المبكرة", late_blight: "اللفحة المتأخرة" },
    bean: { healthy: "سليم", other_disease: "مرض آخر", rust: "الصدأ" },
  },
};

export const DISEASE_DETAILS = {
  en: {
    "other disease": {
      cause: "A disease was detected but it does not match a known class in the training data.",
      treatment: "Consult a local agricultural extension officer for accurate diagnosis and treatment recommendations.",
    },
    rust: {
      cause: "Fungal infection (order Pucciniales) favored by moderate temperatures and prolonged leaf wetness.",
      treatment: "Use resistant varieties. Apply sulfur or triazole fungicides. Remove infected debris after harvest.",
    },
    "common rust": {
      cause: "Puccinia sorghi spores spread by wind across fields.",
      treatment: "Use rust-resistant hybrids. Apply triazole fungicides if infection exceeds 10%.",
    },
    "cercospora leaf spot gray leaf spot": {
      cause: "Cercospora zeae-maydis overwintering in crop residue, favored by warm, humid weather.",
      treatment: "Improve drainage, practice annual rotation, apply foliar fungicides, and till crop residue under.",
    },
    "northern leaf blight": {
      cause: "Exserohilum turcicum fungus spread by wind and rain, thriving in moderate temperatures with high humidity.",
      treatment: "Use resistant hybrids. Apply strobilurin or triazole fungicides. Rotate crops and manage crop residue.",
    },
    "early blight": {
      cause: "Alternaria solani fungus attacking older foliage under alternating wet and dry conditions.",
      treatment: "Apply protectant fungicides (chlorothalonil or mancozeb). Space plants out and irrigate early in the day.",
    },
    "late blight": {
      cause: "Phytophthora infestans oomycete spreading rapidly in cool, wet weather. The pathogen that caused the Irish Potato Famine.",
      treatment: "Apply systemic fungicides (mefenoxam, cymoxanil) at first sign. Destroy infected plants immediately to prevent spread.",
    },
    healthy: {
      cause: "Optimal nutrition and strong immune response. No signs of disease detected.",
      treatment: "Maintain standard irrigation, nitrogen-balanced fertilisation, and regular scouting.",
    },
    unknown: {
      cause: "This image does not match any known crop disease patterns. It may be an unrelated object, a non-plant image, or a crop not covered by the training data.",
      treatment: "Try a clearer photo of the leaf with even lighting. If the problem persists, consult an agricultural expert.",
    },
  },
  rw: {
    "other disease": {
      cause: "Indwara yasanuwe ariko ntabwo ihuye n'indwara zizwi mu makosa y'uburirirwa.",
      treatment: "Shaka inama ku muganga w'ubuhinzi kugira ngo ubone isuzuma nyakuri.",
    },
    rust: {
      cause: "Igihumyo cya Pucciniales gikunze kuboneka mu bukonje buoroheje n'ubushyuhe bukabije.",
      treatment: "Tera imbuto zihanganira indwara. Koresha imiti ya sulfur cyangwa triazole.",
    },
    "common rust": {
      cause: "Udusanduku tw'indwara uterwa n'umuyaga.",
      treatment: "Guhinga imbuto zihanganira indwara no gukoresha imiti kare.",
    },
    "cercospora leaf spot gray leaf spot": {
      cause: "Igihumyo cya Cercospora zeae-maydis gikira mu bisigazwa by'imyaka.",
      treatment: "Kuvomera neza, guhinduranya ibihingwa, no gukoresha imiti y'amababi.",
    },
    "northern leaf blight": {
      cause: "Igihumyo cya Exserohilum turcicum gikwira n'umuyaga n'imvura.",
      treatment: "Koresha imbuto zihanganira indwara no gukoresha imiti yabugenewe.",
    },
    "early blight": {
      cause: "Igihumyo cya Alternaria solani kiba mu bishandza n'amababi bishaje.",
      treatment: "Gukoresha imiti yabugenewe (Fungicides). Kuvomera mu gitondo amababi agakuka kare.",
    },
    "late blight": {
      cause: "Ibihumyo bya Phytophthora infestans bikwira vubi mu gihe gikonje kandi cy'ubushyuhe.",
      treatment: "Koresha imiti ikomeye mu buryo bwihuse. Amahera ibihingwa byanduye ako kanya.",
    },
    healthy: {
      cause: "Ikimera gifite imirire myiza n'ubudahangarwa bukomeye.",
      treatment: "Komeza kuvomera neza no gushyiramo ifumbire.",
    },
    unknown: {
      cause: "iyi foto ntabwo ihuye n'indwara z'ibihingwa zizwi. Birashoboka ko ari ikintu kidahujwe n'ibihingwa.",
      treatment: "Gerageza gufata ifoto irushijeho kuba nziza. Niba ikibazo kigikomeza, shaka ubufasha ku muganga w'ubuhinzi.",
    },
  },
  fr: {
    "other disease": {
      cause: "Maladie détectée mais ne correspond à aucune classe connue dans les données d'apprentissage.",
      treatment: "Consultez un agent de vulgarisation agricole pour un diagnostic précis.",
    },
    rust: {
      cause: "Infection fongique (ordre Pucciniales) favorisée par des températures modérées et une humidité prolongée.",
      treatment: "Plantez des variétés résistantes. Appliquez du soufre ou des fongicides triazole.",
    },
    "common rust": {
      cause: "Spores de Puccinia sorghi dispersées par le vent dans les champs.",
      treatment: "Utilisez des hybrides résistants à la rouille. Appliquez des fongicides triazole si l'infection dépasse 10%.",
    },
    "cercospora leaf spot gray leaf spot": {
      cause: "Cercospora zeae-maydis survit dans les résidus de culture, favorisé par un temps chaud et humide.",
      treatment: "Améliorez le drainage, pratiquez la rotation annuelle et appliquez des fongicides foliaires.",
    },
    "northern leaf blight": {
      cause: "Champignon Exserohilum turcicum propagé par le vent et la pluie, prospère à des températures modérées avec une humidité élevée.",
      treatment: "Utilisez des hybrides résistants. Appliquez des fongicides strobilurine ou triazole.",
    },
    "early blight": {
      cause: "Champignon Alternaria solani attaquant le feuillage par alternance de temps sec et humide.",
      treatment: "Appliquer des fongicides protecteurs. Espacer les plants pour une meilleure aération.",
    },
    "late blight": {
      cause: "Oomycète Phytophthora infestans se propageant rapidement par temps frais et humide. Responsable de la famine irlandaise.",
      treatment: "Appliquez des fongicides systémiques dès les premiers signes. Détruisez immédiatement les plants infectés.",
    },
    healthy: {
      cause: "Nutrition optimale et défenses immunitaires fortes. Aucun signe de maladie détecté.",
      treatment: "Maintenir l'arrosage standard et une fertilisation équilibrée.",
    },
    unknown: {
      cause: "Cette image ne correspond à aucun modèle de maladie des cultures connu. Il peut s'agir d'un objet non végétal ou d'une culture non couverte.",
      treatment: "Essayez une photo plus nette de la feuille avec un éclairage uniforme. Consultez un expert si le problème persiste.",
    },
  },
  ar: {
    "other disease": {
      cause: "تم اكتشاف مرض لكنه لا يتطابق مع أي فئة معروفة في بيانات التدريب.",
      treatment: "استشر أخصائي الإرشاد الزراعي للحصول على تشخيص دقيق.",
    },
    rust: {
      cause: "عدوى فطرية (رتبة Pucciniales) تنشط في درجات الحرارة المعتدلة والرطوبة الطويلة.",
      treatment: "ازرع أصنافاً مقاومة. استخدم مبيدات الكبريت أو التريازول.",
    },
    "common rust": {
      cause: "فطريات Puccinia sorghi تنتشر عبر الرياح في الحقول.",
      treatment: "استخدام هجن مقاومة للصدأ وتطبيق مبيدات التريازول الفطرية.",
    },
    "cercospora leaf spot gray leaf spot": {
      cause: "فطر Cercospora zeae-maydis يعيش في بقايا المحاصيل ويزدهر في الطقس الدافئ الرطب.",
      treatment: "حسّن الصرف، طبق دورة زراعية سنوية، واستخدم مبيدات فطرية ورقية.",
    },
    "northern leaf blight": {
      cause: "فطر Exserohilum turcicum ينتشر بالرياح والأمطار في درجات حرارة معتدلة ورطوبة عالية.",
      treatment: "استخدم هجينة مقاومة. طبق مبيدات ستروبيلورين أو تريازول الفطرية.",
    },
    "early blight": {
      cause: "فطر ألترناريا سولاني الذي يهاجم الأوراق القديمة في ظروف متقلبة.",
      treatment: "استخدام مبيدات الفطريات الوقائية وتحسين تهوية النباتات.",
    },
    "late blight": {
      cause: "فطر Phytophthora infestans ينتشر بسرعة في الطقس البارد الرطب. المسبب لمجاعة البطاطس الأيرلندية.",
      treatment: "طبق مبيدات فطرية جهازية عند أول علامة. أتلف النباتات المصابة فوراً.",
    },
    healthy: {
      cause: "تغذية ممتالية ودفاعات مناعية قوية. لا توجد علامات مرضية.",
      treatment: "الحفاظ على جداول الري والتسميد المتوازن والفحص المنتظم.",
    },
    unknown: {
      cause: "هذه الصورة لا تتطابق مع أي نمط معروف لأمراض المحاصيل. قد تكون صورة لجسم غير نباتي أو محصول غير مشمول.",
      treatment: "حاول التقاط صورة أوضح للورقة بإضاءة مناسبة. إذا استمرت المشكلة، استشر خبيراً زراعياً.",
    },
  },
};
