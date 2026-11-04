# Gratuit et Pro — fonctionnement au 31 octobre 2026

- Limites gratuites par espace : 6 biens/logements, 7 locataires. Chaque fiche de logement d’un bâtiment compte comme un bien ; un autre inventaire possède la même limite de 6 fiches.
- Vérification après validation de chaque mutation, avant écriture, avec contrôle de révision existant. Une restauration, un formulaire groupé et l’ajout de logements ne peuvent pas contourner la limite. Les fiches déjà présentes restent conservées et modifiables.
- Limite d’export par compte : 3 factures/reçus de loyer distincts, toutes situations de paiement confondues, sans remise à zéro mensuelle. Un brouillon enregistré n’utilise pas d’export. La même location pour le même mois désigne le même document, même lorsque son statut change après paiement.
- L’état `draft` ne publie pas le jeton. L’émission passe par une réservation atomique dans D1 (`free` ou `pro`). Les appels répétés sur un document déjà émis ne consomment pas de nouveau droit. Les anciennes factures utilisent le statut `legacy`, restent accessibles et sont comptées parmi les documents existants pour le quota gratuit. Aucune donnée n’est supprimée par la migration.
- Les aperçus de brouillon sont visuels ; les actions applicatives de partage, lien et impression passent par l’émission serveur. Comme tout aperçu affiché, une capture d’écran reste possible : il ne s’agit pas d’une protection DRM.
- Les quotas gratuits n’empêchent pas de consulter et d’enregistrer les paiements ni de corriger les fiches existantes. La signature et les modèles Pro sont essayables dans le formulaire ; leur enregistrement et la création d’un deuxième espace demandent Pro.

L’aide embarquée comporte les tarifs, conditions du pilote et la notice de confidentialité. Les renseignements du responsable sont ceux disponibles ; aucun NINEA, RCCM ni adresse légale n’a été inventé. Compléter les informations de l’éditeur lors de la formalisation avant l’ouverture publique.

Sources réglementaires consultées le 31 octobre 2026 :

- https://www.cdp.sn/particulier/comprendre-vos-droits
- https://www.cdp.sn/obligations-entreprises
- https://www.cdp.sn/legislation/textes-legislatifs

Ces références servent à présenter les droits et les informations utiles ; la notice du pilote ne constitue pas une certification de conformité ou l’accomplissement des formalités de déclaration.
