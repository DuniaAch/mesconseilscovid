var utils = require('../utils.js')

class AlgorithmeDeconfinement {
    constructor(profil, algoOrientation) {
        this.profil = profil
        this.algoOrientation = algoOrientation
    }

    isQuarantaineDone() {
        let delta = 8
        if (this.algoOrientation.personne_fragile) {
            delta = 10
        }
        return utils.joursAvant(delta) > this.profil.symptomes_start_date
    }

    isSuiviRegulier() {
        // Au moins une entrée ces dernières 24h + une entrée ces dernières 48h.
        return (
            this.profil.suiviDerniersJours(1).length >= 1 &&
            this.profil.suiviDerniersJours(2).length >= 2
        )
    }

    isFievreDone() {
        return this.profil.suiviDerniersJours(2).every((etat) => etat.fievre === 'non')
    }

    isEssoufflementDone() {
        return this.profil
            .suiviDerniersJours(2)
            .every((etat) => etat.essoufflement === 'non')
    }

    isDeconfinable() {
        return (
            this.isQuarantaineDone() &&
            this.isSuiviRegulier() &&
            this.isFievreDone() &&
            this.isEssoufflementDone()
        )
    }
}

module.exports = {
    AlgorithmeDeconfinement,
}
