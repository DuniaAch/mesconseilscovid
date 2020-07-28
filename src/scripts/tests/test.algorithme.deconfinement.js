var assert = require('chai').assert

var utils = require('../utils.js')
var AlgorithmeOrientation = require('../algorithme/orientation.js')
    .AlgorithmeOrientation
var AlgorithmeDeconfinement = require('../algorithme/deconfinement.js')
    .AlgorithmeDeconfinement

var Profil = require('../profil.js').Profil
var profil = new Profil('mes_infos')

describe('Algorithme déconfinement', function () {
    beforeEach(function () {
        profil.resetData()
    })

    afterEach(function () {
        profil.resetData()
    })

    describe('Quarantaine sans personne fragile', function () {
        it('Faux si aujourd’hui', function () {
            const today = new Date()
            profil.symptomes_start_date = today
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isQuarantaineDone(), false)
        })

        it('Faux s’il y a 8 jours', function () {
            profil.symptomes_start_date = utils.joursAvant(8)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isQuarantaineDone(), false)
        })

        it('Vrai s’il y a 9 jours', function () {
            profil.symptomes_start_date = utils.joursAvant(9)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isQuarantaineDone(), true)
        })
    })

    describe('Quarantaine avec personne fragile', function () {
        it('Faux si aujourd’hui', function () {
            const data = {
                grossesse_3e_trimestre: true,
            }
            profil.fillData(data)
            const today = new Date()
            profil.symptomes_start_date = today
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isQuarantaineDone(), false)
        })

        it('Faux s’il y a 10 jours', function () {
            const data = {
                grossesse_3e_trimestre: true,
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(10)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isQuarantaineDone(), false)
        })

        it('Vrai s’il y a 11 jours', function () {
            const data = {
                grossesse_3e_trimestre: true,
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(11)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isQuarantaineDone(), true)
        })
    })

    describe('Régularité', function () {
        it('Vrai si une entrée ces dernières 24h + une entrée ces dernières 48h', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                    },
                    {
                        date: utils.joursAvant(1),
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isSuiviRegulier(), true)
        })

        it('Faux si une entrée ces dernières 24h seulement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isSuiviRegulier(), false)
        })

        it('Faux si une entrée ces dernières 48h seulement', function () {
            const data = {
                suivi: [
                    {
                        date: utils.joursAvant(1),
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isSuiviRegulier(), false)
        })
    })

    describe('Fièvre', function () {
        it('Vrai si suivi récent sans fièvre', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isFievreDone(), true)
        })

        it('Faux si suivi récent avec fièvre', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isFievreDone(), false)
        })

        it('Vrai si suivi > 48h sans fièvre', function () {
            const data = {
                suivi: [
                    {
                        date: utils.joursAvant(3),
                        fievre: 'non',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isFievreDone(), true)
        })

        it('Vrai si suivi > 48h avec fièvre', function () {
            const data = {
                suivi: [
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isFievreDone(), true)
        })

        it('Faux si suivi récent avec fièvre + > 48h avec fièvre', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'oui',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isFievreDone(), false)
        })

        it('Vrai si suivi récent sans fièvre + > 48h avec fièvre', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isFievreDone(), true)
        })
    })

    describe('Essoufflement', function () {
        it('Vrai si suivi récent sans essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        essoufflement: 'non',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isEssoufflementDone(), true)
        })

        it('Faux si suivi récent avec essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isEssoufflementDone(), false)
        })

        it('Vrai si suivi > 48h sans essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: utils.joursAvant(3),
                        essoufflement: 'non',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isEssoufflementDone(), true)
        })

        it('Vrai si suivi > 48h avec essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: utils.joursAvant(3),
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isEssoufflementDone(), true)
        })

        it('Faux si suivi récent avec essoufflement + > 48h avec essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        essoufflement: 'oui',
                    },
                    {
                        date: utils.joursAvant(3),
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isEssoufflementDone(), false)
        })

        it('Vrai si suivi récent sans essoufflement + > 48h avec essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isEssoufflementDone(), true)
        })
    })

    describe('Déconfinable sans personne fragile', function () {
        it('Vrai s’il y a 9 jours et plus de fièvre ni essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(9)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), true)
        })

        it('Faux s’il y a 9 jours et plus de fièvre ni essoufflement mais sans régularité', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(9)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })

        it('Faux s’il y a 8 jours et plus de fièvre ni essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(8)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })

        it('Faux s’il y a 9 jours et fièvre récente mais pas essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'oui',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(9)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })

        it('Faux s’il y a 9 jours et plus de fièvre mais essoufflement', function () {
            const data = {
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'oui',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(9)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })
    })

    describe('Déconfinable avec personne fragile', function () {
        it('Vrai s’il y a 11 jours et plus de fièvre ni essoufflement', function () {
            const data = {
                grossesse_3e_trimestre: true,
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(11)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), true)
        })

        it('Vrai s’il y a 11 jours et plus de fièvre ni essoufflement mais pas régularité', function () {
            const data = {
                grossesse_3e_trimestre: true,
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(11)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })

        it('Faux s’il y a 10 jours et plus de fièvre ni essoufflement', function () {
            const data = {
                grossesse_3e_trimestre: true,
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(10)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })

        it('Faux s’il y a 11 jours et fièvre récente mais pas essoufflement', function () {
            const data = {
                grossesse_3e_trimestre: true,
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'oui',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(11)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })

        it('Faux s’il y a 11 jours et plus de fièvre mais essoufflement', function () {
            const data = {
                grossesse_3e_trimestre: true,
                suivi: [
                    {
                        date: new Date(),
                        fievre: 'non',
                        essoufflement: 'oui',
                    },
                    {
                        date: utils.joursAvant(1),
                        fievre: 'non',
                        essoufflement: 'non',
                    },
                    {
                        date: utils.joursAvant(3),
                        fievre: 'oui',
                        essoufflement: 'oui',
                    },
                ],
            }
            profil.fillData(data)
            profil.symptomes_start_date = utils.joursAvant(11)
            const algoOrientation = new AlgorithmeOrientation(profil)
            const algoDeconfinement = new AlgorithmeDeconfinement(
                profil,
                algoOrientation
            )
            assert.strictEqual(algoDeconfinement.isDeconfinable(), false)
        })
    })
})
